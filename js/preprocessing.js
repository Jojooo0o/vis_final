// Data on Mass Shootings in the US from 2014 to 2018 (http://www.gunviolencearchive.org)
var dataPaths = ["../data/mass_shootings_2014.csv", "../data/mass_shootings_2015.csv",
                 "../data/mass_shootings_2016.csv", "../data/mass_shootings_2017.csv"];     // saves paths of data sets


function parseCSV() {
  /*d3.csv("../data/mass_shootings_2014.csv", function(data) {
    console.log(data[0]);
  });*/

  Promise.all(d3.csv("../data/mass_shootings_2014.csv")).then(
  function(data) {
    console.log(data[0])
  });
}
