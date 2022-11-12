# hotelhousekeepingqa

This is my own version of the
[Inventory Application](https://www.theodinproject.com/lessons/nodejs-inventory-application).
This is a real-world app with real business data. The housekeeping department is
responsible for cleaning the guest rooms in the hotel. The hotel sends
questionaries to the guests about their stays. The guests can give a score
between 1 and 10 to the cleanliness of the guestroom. The hotels use a
percentage measure to describe guest satisfaction. This measure is the ratio of
the number 9 and 10 scores to the total number of scores. We get this percentage
measure in every month and year.

This program follows the daily tasks of the cleaners on the housekeeping
department. We can input the data of the daily tasks manually or from a report
file (text file). The same is true for the guest feedback data. When all the
data is available, the program filters the guest feedback data between the
cleaners and calculates the percentage values for each cleaner and other
statistical measures. This can be used for quality assurance purposes.

This program in daily usage and the manager asked me a new feature. The
supervisors do spotchecks on the serviced rooms and give a score to the
cleaners. The score is a percentage between 0 and 100. The 100% is the perfect
room without any issue. The program is capable to store these audit scores as
well and can calculate the average for the cleaners daily, monthly and year to
date.

## Usage

When you open the page the first view summerizes the data uploaded about today. 
![image](https://user-images.githubusercontent.com/60119137/201473977-70d4bd85-3260-4cb5-bcc9-865202517c0e.png)
You can see in the middle that all the services are 0. This simply just means, that there is no data in the database
about this day yet. You can see the days in the current month in a diary component at the right bottom corner. 
No days has green ticks, which means that no service data has been uploaded for the current month yet. Where can you see
some uploaded real life data?

### Changing the date

You can change the date at the left hand side with the date input. Let's go back for example to 15/12/2021. 
![image](https://user-images.githubusercontent.com/60119137/201474375-ebbbb77b-357d-407b-99ad-7f0eafbf553f.png)
The above view is visible after you clicked the Home link at the left top corner. In the middle you can see
that on 15/12/2022 the team serviced 67 depart rooms and 52 stay over rooms. There was no linen change in any
stayover room, there was no service stay over room (guest, who refused stay over service) and no DND (guest, 
who put on the Do Not Disturb sign, so the team could not service the room). At the right side, above the diary
component you can see where the daily service records can be uploaded. You need to know the password for this.
These files are generated by the paper free system (called Synergy), which the hotel uses to manage the workflow.
How can you see what exactly happened in the hotel?

### Hotel pages

If you press the Visit Page button at the bottom left corner th following page appears:
![image](https://user-images.githubusercontent.com/60119137/201475814-04983da0-e6b0-4c9a-b10f-9d39da68a9a3.png)
You can see for example that room 2028 was serviced by Wendy as a depart room (she cleaned the room after 
the guest checked out). This is the view where you can modify daily service records or delete them. You need the
password for this too. The hotel is devided to 9 different sections, which are described by 9 different pages like
this page. You can navigate between these pages by the << and >> buttons at the top right or just change the page
number at the left and press the Visit Page button again. How can we see the guest feedback data?

### Feedbacks

Now click the Feedbacks link at the left. After a while of loading you will get the following view:
![image](https://user-images.githubusercontent.com/60119137/201476798-b88092cc-9244-490b-a2cc-f5b2597ff119.png)
This is the view where you can see monthly guest feedback data and upload the files, which contain this data. 
Uploading data is protected by the password. You can see here for example that the hotel received a feedback in
December 2021 for Room 2032. The guest checked in on 27/12/2021, checked out at 29/12/2021 and gave score number 10
for the clineliness. You can also see that the room was serviced as depart before the guest arrived by Wendy and
later during the stay by Thisarani. This is the 5th row in the table.

### Analyse Button

You can analyse the guest feedback data by pressing the Analyse button. This gives monthly analysis for the depart 
services. You can see this:
![image](https://user-images.githubusercontent.com/60119137/201477385-5d62d9b2-74a1-4b63-86ba-718d9e4ba2a2.png)
The first line shows that the hotel received 148 feedbacks with clinliness score. The average ratio of the good
scores (9 and 10) to the number of all scores is 70.27%. This is the 1th row and the Salt (Satisfactority And Loyality Tracker) 
column. The other important column is the Complain one as this shows the ratio of bad scores (7 or below) to the total number
of scores. We also calculate the mathematical average and standard deviation, which are statistical estimates of the performance 
of the hotel and the individual cleaners' performance. The monthly cleaners' data is strongly influenced by the statistical 
fluctuations as the number of individual feedbacks are relatively low. The same analysis can be executed for all the data in 2021.
All you need to do is checking the Yeartodate checkbox and pressing the Analyse button again. This leads much more accurate results.

### Distribution graphs

It is interesting to see the individual performance compared to the hotel overall performance in the form of bar charts. Just 
press the show link in the graph column in the relevant cleaners' row. For example pressing the show link in Wendy's row leads to
the following view:
![image](https://user-images.githubusercontent.com/60119137/201478336-b8ca0898-2d34-460f-bc43-9662e6e224a2.png)
The graph shows that Wendy's performance in December 2021 is way above than the hotel average. She has much higher number 10 scores
ratio than the hotel average and no bad scores at all. The hotel averages are the blue bars. The score ratios of good cleaners are 
represented by green bars opposed by red bars for bad cleaners. You can see this by Zsuzsanna's graph:
![image](https://user-images.githubusercontent.com/60119137/201478705-93019e5a-fd3f-42b9-8c38-b50f5030eb9a.png)
