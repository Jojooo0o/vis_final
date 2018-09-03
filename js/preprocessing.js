// Data on Mass Shootings in the US from 2014 to 2018 (http://www.gunviolencearchive.org)
var dataPaths = ["../data/mass_shootings_2014.csv", "../data/mass_shootings_2015.csv",
                 "../data/mass_shootings_2016.csv", "../data/mass_shootings_2017.csv"];     // saves paths of data sets


function parseCSV() {
  Promise.all([d3.csv(dataPaths[0]),
              d3.csv(dataPaths[1]),
              d3.csv(dataPaths[2]),
              d3.csv(dataPaths[3])])
  .then(function(data) {
    for(var i = 0; i <= dataPaths.length; ++i)
      console.log(data[i]);
  }).catch(function(error) {
  });
}
