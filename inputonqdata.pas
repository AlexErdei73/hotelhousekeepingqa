unit InputOnQData;

{$mode objfpc}{$H+}

interface

uses
  Classes, SysUtils, Workforce, Process, Strutils, DateUtils;

const SYNERGY_DIR = 'SynergyTXT';

var
WorkDir:   String;
ExeDir:    String;
FileNameList: TStringList;
SynergyDir: String;


procedure InitOnQHandling;
procedure Dir(path: string; fmask: string; FNameList: TStringList);
procedure PDFtoTxt(inpath: string; outpath: string; FNameList: TStringList);
procedure CloseOnQHandling;
function GetName(fname: string): string;
procedure ReadTxtFile(path: string; fname: string);
procedure LoadArchive;
function GetDateStr(fname: string): string;
procedure ReadTxtSynergyFile(path: string; fname: string);
procedure LoadSynergy;

implementation

procedure InitOnQHandling;
begin
  FileNameList:=TStringList.Create;
  ExeDir:=GetCurrentDir;
  WorkDir:=IncludeTrailingPathDelimiter(ExeDir)+'temp';
  SynergyDir:=IncludeTrailingPathDelimiter(ExeDir)+SYNERGY_DIR;
end;

procedure Dir(path: string; fmask: string; FNameList: TStringList);
Var
   Info : TSearchRec;
   DN : String;
begin
  FNameList.Clear;
  DN:=IncludeTrailingPathDelimiter(path);
  if FindFirst(DN+fmask,faAnyFile,Info)=0 then
  try
     Repeat
       FNameList.Add(Info.Name);
     Until FindNext(Info)<>0;
  finally
    FindClose(info);
  end;
end;

procedure PDFtoTxt(inpath: string; outpath: string; FNameList: TStringList);
var
   i,len: integer;
   fname: string;
   fnameout: string;
   output: string;
begin
    for i:=0 to FNameList.Count-1 do
    begin
      fname:=FNameList.Strings[i];
      len:=Length(fname);
      fnameout:=copy(fname,1,len-3)+'txt';
      FNameList.Strings[i]:=fnameout;
      fnameout:=IncludeTrailingPathDelimiter(outpath)+fnameout;
      fname:=IncludeTrailingPathDelimiter(inpath)+fname;
      if not(FileExists(fnameout)) then
        RunCommand(IncludeTrailingPathDelimiter(ExeDir)+'pdftotext.exe',['-simple',
        fname,fnameout],output);
    end;
end;

function GetName(fname: string): string;
begin
  result:=ExtractWord(1,fname,['_'])+'_'+ExtractWord(2,fname,['_']);
end;

procedure ReadTxtFile(path: string; fname: string);
var F: TextFile;
    name: string;
    DN: string;
    line: string;
    clr,i: word;
    roomnumber: integer;
    task: char;
    chkoutdate: TDateTime;
    DD,MM,YYYY: word;
begin
   name:=GetName(fname);
   clr:=0;
   for i:=1 to NCleaner do
     if not ContainsStr(Gonecleaner,copy(name,1,Length(Namecleaner[i]))) then
       if UpperCase(Namecleaner[i])=copy(name,1,Length(Namecleaner[i])) then
         clr:=i;
   if clr<>0 then
   begin
     DN:=IncludeTrailingPathDelimiter(path)+fname;
     assign(F,DN);
     if FileExists(DN) then
     begin
       Reset(F);
       repeat
         readln(F,line);
         roomnumber:=StrToIntDef(ExtractWord(1,line,[' ']),-1);
         task:=' ';
         if roomnumber<>-1 then
         begin
           if ExtractWord(5,line,[' '])='V/D' then task:='D'
           else if ExtractWord(6,line,[' '])='*' then task:='D'
               else if ExtractWord(2,line,[' '])='N' then task:='S'
                    else task:='L';
           if ExtractWord(6,line,[' '])='' then task:=' ';
           if task='L' then
             begin
               line:=ExtractWord(6,line,[' ']);
               DD:=StrToInt(ExtractWord(1,line,['/']));
               MM:=StrToInt(ExtractWord(2,line,['/']));
               YYYY:=StrToInt(ExtractWord(3,line,['/']));
               chkoutdate:=EncodeDate(YYYY,MM,DD);
               if chkoutdate=Tomorrow then task:='S';
             end;
           WriteRoom(roomnumber,clr,task);
           //Cleaner[clr].Working:=true;
         end;
       until EOF(F);
     Close(F);
     end;
   end;
end;

procedure LoadArchive;
var i: integer;
begin
   Dir(ArchivDir,'*.PDF',FileNameList);
   PDFToTxt(ArchivDir,WorkDir,FileNameList);
   for i:=0 to FileNameList.Count-1 do
     ReadTxtFile(WorkDir,FileNameList.Strings[i]);
end;

procedure LoadSynergy;
var i: integer;
    fname: string;
begin
   Dir(SynergyDir,'*.TXT',FileNameList);
   fname := FileName;
   for i:=0 to FileNameList.Count-1 do
   begin
     FileName := getDateStr(FileNameList[i])+'AM.dat';
     if not(FileExists(FileName)) then
     begin
       ReadTxtSynergyFile(SynergyDir, FileNameList[i]);
       Save;
       Initialize;
     end;
   end;
   FileName := fname;
end;

function GetDateStr(fname: string): string;
var day, month, year, date: string;
begin
    date := copy(ExtractWord(3, fname, ['-']),2,10);
    month := ExtractWord(1, date, ['.']);
    if month[1]='0' then month:=month[2];
    day := ExtractWord(2, date, ['.']);
    if day[1]='0' then day:=day[2];
    year := ExtractWord(3, date, ['.']);
    date := year + '-' + month + '-' + day;
    result := date;
end;

procedure ReadTxtSynergyFile(path: string; fname: string);
const DEPART = 'Check Out';
      STAY = 'Stay Over';
      LINEN = 'Stay Over + Linen';
      DND = 'Do Not Disturb';
      NOSERVICE = 'Service Refused';
var F: TextFile;
    name: string;
    FullPath: string;
    line: string;
    secondWord: string;
    thirdWord: string;
    clr, i: word;
    roomnumber: integer;
    task: char;
    flag: word;
begin
    FullPath:=IncludeTrailingPathDelimiter(path)+fname;
    assign(F,FullPath);
    if FileExists(FullPath) then
    begin
      Reset(F);
      repeat
        ReadLn(F, line);
        roomnumber:=StrToIntDef(ExtractWord(1,line,[chr(9)]),-1);
        if roomnumber<>-1 then
        begin
          secondWord := ExtractWord(2, line, ['"']);
          thirdWord := ExtractWord(3, line, ['"']);
          name := ExtractWord(1, secondWord, [',']);
          task := ' ';
          flag := 0;
          if thirdWord.IndexOf(DEPART) > -1 then task := 'D';
          if thirdWord.IndexOf(STAY) > -1 then task := 'S';
          if thirdWord.IndexOf(LINEN) > -1 then task := 'L';
          if line.IndexOf(DND) > -1 then flag:=1;
          if line.IndexOf(NOSERVICE) > -1 then flag:=2;
          clr := 0;
          for i:=1 to NCleaner do
            if Namecleaner[i]=name then clr:=i;
          if (clr<>0) and (task<>' ') then
             WriteRoom(roomnumber,clr,task,flag);
        end;
      until EOF(F);
    end;
end;

procedure CloseOnQHandling;
begin
  FileNameList.Free;
end;

end.

