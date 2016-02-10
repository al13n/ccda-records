(function() {
    'use strict';

    function HomeCtrl($http, $q) {
        var home = this;
        home.isAbnormal = isAbnormal;

        function get(url, configobj) {
            var promise = $http.get(url, configobj);
            var deferred = $q.defer();

            promise.then(function(res) {
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        function getAllPatientsData(token) {
            var url = "/patientsData";
            return get(url, {});
        }

        function processedDataObject(demographics, results) {
            return {
                "demographics": demographics,
                "results": results
            };
        }

        function isAbnormal(result){
            return (result.abnormality != "-");
        }

        function process(data) {
            var processedList = [];
            for (var i = 0; i < data.length; i++) {
                var obj = new processedDataObject(data[i].demographics, []);
                for (var j = 0; j < data[i].results.length; j++) {
                    var test = data[i].results[j].tests[0];
                    var bloodTestPattern1 = /in Serum or Plasma$/g;
                    var bloodTestPattern2 = "BLOOD";
                    var res1 = bloodTestPattern1.test(test.name);
                    var res2 = (test.name.toUpperCase().indexOf(bloodTestPattern2) > -1);

                    if ((res1 === true) || (res2 === true)) {
                        /*
                        test.name = test.name.replace("in Serum or Plasma", "");
                        test.name = test.name.replace("[Mass/volume]", "");
                        test.name = test.name.replace("[Moles/volume]", "");
                        test.name = test.name.replace("[#/volume]", "");
                        test.name = test.name.replace("in Blood", "");
                        test.name = test.name.replace("by Automated count", "");
                        */
                        var range = data[i].results[j].tests[0].reference_range.text.split(" ")[0];
                        var upper = Number(range.split("-")[1]);
                        var lower = Number(range.split("-")[0]);
                        var value = Number(data[i].results[j].tests[0].value);
                        if(value > upper){
                            test.abnormality = "High: >" + String(upper);
                        }
                        else if(value < lower){
                            test.abnormality = "Low: <" + String(lower);
                        }
                        else{
                            test.abnormality = "-";
                        }
                        //console.log(range);
                        obj.results.push(test);
                    }

                }
                processedList.push(obj);
            }
            //console.log(processedList);
            home.patientsData = processedList;
        }

        function init() {
            getAllPatientsData()
                .then(function(data) {
                    process(data);
                    //home.patientsData = data;
                    //console.log(data);
                });
        }

        init();
    }

    var app = angular.module('ccda');
    app.controller('HomeCtrl', ['$http', '$q', HomeCtrl]);
})();