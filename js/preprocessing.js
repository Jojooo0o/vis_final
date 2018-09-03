// Data on Mass Shootings in the US from 2014 to 2018 (http://www.gunviolencearchive.org)
var dataPaths = ["../data/mass_shootings_2014.csv", "../data/mass_shootings_2015.csv",
                 "../data/mass_shootings_2016.csv", "../data/mass_shootings_2017.csv"];     // saves paths of data sets

// Transform Months from String to Number;
var theYear = {January: 1, February: 2, March: 3, April: 4, May: 5, June: 6, July: 7,
              August: 8, September: 9, October: 10, November: 11, December: 12};

var count = 0;


function parseCSV() {
  Promise.all([d3.csv(dataPaths[0]),
              d3.csv(dataPaths[1]),
              d3.csv(dataPaths[2]),
              d3.csv(dataPaths[3])])
  .then(function(data) {
    // Iterate over all Datasets
    for(count = 0; count < dataPaths.length; ++count){
      for(var j = 0; j <= data[count].length; ++j) {
        var current_incident = data[count][j];
        // Change Date for every data entry of ever dataset
        current_incident["Incident Date"] = rewriteDate(current_incident["Incident Date"]);
      }

      //rewriteDate(data);
    }
  }).catch(function(error) {
  });
}

function rewriteDate(date) {
  // convert to international standard date (YYYY-MM-DD)
  var year = date.match(new RegExp('[0-9]{4}'));
  var month = date.match(new RegExp('[a-zA-Z]+'));
  var day = date.match(new RegExp('[0-9]{2}'));
  month = theYear[month];
  return year + "-" + month + "-" + day;
}
