# PirateAction v2

****

### Steps:

+ create updated CSV (Comma as delimeter) with header, as [this one](https://github.com/xqin1/pirateaction2/blob/master/data/pirateaction_test.csv), name it as 'pirateaction_test.csv'.
+ push the above file to [this folder](https://github.com/xqin1/pirateaction2/tree/gh-pages/data) in gh-pages branch
+ hit [this url](http://xqin1.github.io/pirateaction2/index.html#test) to verify everything works as expected
+ rename the csv file to 'pirateaction.csv' and push to gh-pages branch
+ the site with updated recoreds is live [here](http://xqin1.github.io/pirateaction2/index.html)

### CSV file specifications:

#### CSV file needs to have the following fields, the field names are important but the order of the fields is not:

+ date: in mm/dd/yyyy format. e.g. 8/7/2010 OR 08/07/2010
+ casename: a string. e.g. case name xxxxxx
+ url: complete url for reference on FCC web site. e.g. http://www.fcc.gov/eb/FieldNotices/2003/DOC-292678A1.html 
+ lat: latitude, in decimal degree. e.g. 45.36
+ long: longitude, in decimal degree. e.g. -102.55
+ city: a string. e.g. Rockville
+ state: a string. e.g. MD
+ caseno: a string. e.g. EB-09-MA-0124
+ typeaction: a string, with all capital letters. Currently the application support these action types: "NAL", "NOUO", "FO", "OTHER", "M.O.&O.", "CD", "NOV", "ERRATUM"
+ amount: a number. use 0 when not applicable. e.g. 2000 OR 0


