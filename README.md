# FlashDash

First of all i dont condone piracy and this program shound not be used for piracy!!
Where u get the download resources from is not my problem and i want add any resources where to get the downlaod repositris from!

What is flash dash? 

Flash dash is a way to easly download and manage thos downloads on a remote server!
So a download manager just for ur Server? Something like aria? 
Well yes kinda...
But also it can do much more first
- FlashDash has an real UI and isnt CLI only
- U can directly add repositorys to download from and browse (HTTP, FTP)
- Filtering throw downloadable files is way easyer
- Way more beginner friendly

To show of where i come from.
At the start i used Wget which is fine but not a real solution.
Then i switch to aria which is better but not user friendly and i have to coppy all the files to there right destinations after the downlaod which dosent make it really automatic!

Now i want something where i can select my destination past my link and it downlaods.

The backend will be flask again like always first because its easyer to manage files via the OS libart but allso becasue its just whit what i am commfy with and i dont want bigg bugs in a software that has file acces!

Its manly used or expected to be hosted on Linux. In my case Debian 15. It should work with other distros 2 but i wont promiss anything.

Alot of material that was i had before is made by me already for a nother project.
this includes the background that is hard to see. I can recommend using because its pretty light on recourses and looks good atleast i think that :3

## Installation

### Aria as a downlaod engin

Download aria2c via ur package manager. 
Then enable rpc.

```bash
aria2c --enable-rpc
```