

var data,dataByState,otherDataByState,nalDataByState,nouoDataByState,foDataByState;
var currentType = 'all';
var actionDetails = {
  state: '',
  statename: ''
};
var caseTypeName={"NAL":"NAL", "NOUO":"NOUO", "FO":"FORFEITURE ORDER", "OHTER": "OTHER"};
var map = L.mapbox.map('map', 'fcc.map-toolde8w')
      .setView([39.5, -98.5], 4);

var radius = d3.scale.sqrt().range([12,40])
var format = d3.time.format("%m/%d/%Y");

var dataFileName = "pirateaction.csv";
if (window.location.href.split("#")[1] == "test"){
  dataFileName = "pirateaction_test.csv";
}

queue()
  .defer(d3.csv, "data/" + dataFileName)
  .defer(d3.json, "data/state_centroid.geojson")
  .await(ready);
//d3.tsv("data/school_stat.tsv", function(error, school) {
function ready(error, piratedata,stateCentroid){
  data = piratedata;
  data.forEach(function(d){d.date = format.parse(d.date);d.amount == null? d.amount =0 : d.amount = +d.amount});

  var dateExtent = d3.extent(data,function(d){return d.date});
  d3.select('#title').html("<h1>Summary of <span class='red-title'>Enforcement Actions</span>(" + 
                          format(dateExtent[0]) + "-" + format(dateExtent[1]) + ")</h1>");
  
  dataByState = d3.nest()
      .key(function(d){return d.state.toUpperCase()})
      .entries(data);
  nalDataByState = d3.nest()
      .key(function(d){return d.state.toUpperCase()})
      .entries(data.filter(function(d){return d.actiontype.toUpperCase()=='NAL'}));
  nouoDataByState = d3.nest()
      .key(function(d){return d.state.toUpperCase()})
      .entries(data.filter(function(d){return d.actiontype.toUpperCase()=='NOUO'}));
  foDataByState = d3.nest()
      .key(function(d){return d.state.toUpperCase()})
      .entries(data.filter(function(d){return d.actiontype.toUpperCase()=='FO'}));
  otherDataByState = d3.nest()
      .key(function(d){return d.state.toUpperCase()})
      .entries(data.filter(function(d){return d.actiontype.toUpperCase()!='NAL' && d.actiontype.toUpperCase()!='NOUO' && d.actiontype.toUpperCase()!='FO' }));
  
  centroids = d3.nest()
    .key(function(d){return d.properties.abbrname})
    .map(stateCentroid.features)

  radius.domain(d3.extent(dataByState,function(d){return d.values.length}));
  drawCircle('all');

}

function drawCircle(type){
  d3.selectAll('path').remove();
  d3.selectAll('.label').remove();
  var dataset;
  if (type == 'all'){
    dataset = dataByState;
  }
  else if (type == 'NOUO'){
    dataset = nouoDataByState;
   // radius.domain([nouoCountMin,nouoCountMax]);
  }
  else if (type == 'NAL'){
    dataset = nalDataByState;
    //radius.domain([nalCountMin,nalCountMax]);
  }
  else if (type == 'FO'){
    dataset = foDataByState;
   // radius.domain([foCountMin,foCountMax]);
  }
    else if (type == 'OTHER'){
    dataset = otherDataByState;
   // radius.domain([otherCountMin,otherCountMax]);
  }
    dataset.forEach(function(d){
       var lat = centroids[d.key][0].geometry.coordinates[1];
       var lon = centroids[d.key][0].geometry.coordinates[0];
       var state = d.key;
       var circle = new L.circleMarker([lat,lon],{color:'lightSteelBlue',weight:1,fillColor:'red',fillOpacity:0.2});
      circle.setRadius(radius(d.values.length));
      circle.on('mouseover', function(e){highlight(e,'mouseover', d.key)});
       circle.on('mouseout', function(e){unhighlight(e)});
       circle.on('click', function(e){highlight(e,'click',d.key)})
      circle.addTo(map);
      var label = new L.Marker([lat,lon], {
          icon: new L.DivIcon({
              className: 'label',
              iconSize: [radius(d.values.length),radius(d.values.length)],
              iconAnchor: new L.Point(radius(d.values.length)/3, radius(d.values.length)/2),
              html: '<div>'+ d.values.length +'</div>'
            })
          })
      label.addTo(map)
    })

}

function highlight(e,action,state){
  e.target.options.fillOpacity=0.5;
  e.target._updateStyle();
console.log(action + " " + state)
 $('#tooltips').html('<div class="inner">' + showTableContent(action,state) + '</div>')
 initTblSort();
}

function unhighlight(e){
    e.target.options.fillOpacity=0.2;
    e.target._updateStyle();

}

function showTableContent(action,state) {

  var num = dataByState.filter(function(d){return d.key == state})[0].values.length;
  var type = currentType;

  var content = " ";
  var typeByState = getTypeByState(state);
  var numPercent = (num * 100) / data.length;

  actionDetails.state = state;
  actionDetails.statename = centroids[state][0].properties.name;
  
  if (type == "all") {
    content += "<h2>Pirate action details in " + actionDetails.statename + "</h2>";
    content += "<h4>Total pirate action cases: <span class='red'>" + num + "</span></h4>";
    content += "<h4>Percent of total cases: <span class='red'>" + parseFloat(numPercent).toFixed(1) + "%</span></h4>";
    content += "<table id='tbl-summary'><tr><th>Type</th><th>Cases</th><th>Amount</th></tr>";

    if (typeByState[0] == 0) {
      content += "<tr><td>NAL</td>";
    } else {
      content += "<tr><td><a id='NAL' class='lnk-actionDetails' href='#void'>NAL</a></td>";
    }

    content += "<td>" + typeByState[0] + "</td>";
    content += "<td>$" + typeByState[1] + "</td></tr>";

    if (typeByState[2] == 0) {
      content += "<tr><td>NOUO</td>";
    } else {
      content += "<tr><td><a id='NOUO' class='lnk-actionDetails' href='#void'>NOUO</a></td>";
    }

    /*content +="<tr><td>NOUO</td>";*/
    content += "<td>" + typeByState[2] + "</td>";
    content += "<td>$" + typeByState[3] + "</td></tr>";

    if (typeByState[4] == 0) {
      content += "<tr><td>FORFEITURE ORDER</td>";
    } else {
      content += "<tr><td><a id='FO' class='lnk-actionDetails' href='#void'>FORFEITURE ORDER</a></td>";
    }

    /*content +="<tr><td>FORFEITURE ORDER</td>";*/
    content += "<td>" + typeByState[4] + "</td>";
    content += "<td>$" + typeByState[5] + "</td></tr>"

    if (typeByState[6] == 0) {
      content += "<tr><td>M.O.&amp;O.</td>";
    } else {
      content += "<tr><td><a id='M.O.&O.' class='lnk-actionDetails' href='#void'>M.O.&O.</a></td>";
    }

    /*content +="<tr><td>M.O.&amp;O.</td>";*/
    content += "<td>" + typeByState[6] + "</td>";
    content += "<td>$" + typeByState[7] + "</td></tr>"


    if (typeByState[8] == 0) {
      content += "<tr><td>ORDER & CONSENT DECREE</td>";
    } else {
      content += "<tr><td><a id='CD' class='lnk-actionDetails' href='#void'>ORDER & CONSENT DECREE</a></td>";
    }

    /*content +="<tr><td>ORDER & CONSENT DECREE</td>";*/
    content += "<td>" + typeByState[8] + "</td>";
    content += "<td>$" + typeByState[9] + "</td></tr>"
    
    if (typeByState[10] == 0) {
        content += "<tr><td>NOV</td>";
      } else {
        content += "<tr><td><a id='NOV' class='lnk-actionDetails' href='#void'>NOV</a></td>";
      }

      /*content +="<tr><td>ORDER & CONSENT DECREE</td>";*/
      content += "<td>" + typeByState[10] + "</td>";
      content += "<td>$" + typeByState[11] + "</td></tr>"
    
      if (typeByState[12] == 0) {
          content += "<tr><td>ERRATUM</td>";
        } else {
          content += "<tr><td><a id='ERRATUM' class='lnk-actionDetails' href='#void'>ERRATUM</a></td>";
        }

        /*content +="<tr><td>ORDER & CONSENT DECREE</td>";*/
        content += "<td>" + typeByState[12] + "</td>";
        content += "<td>$" + typeByState[13] + "</td></tr>"
    
    
    content += "</table>";
  } else if (type == "NAL") {
    content += "<h2>Pirate NAL action details in " + actionDetails.statename + "</h2>";
    content += "<h4>Total pirate NAL action cases: <span class='red'>" + typeByState[0] + "</span></h4>";
    content += "<h4>Total amount of NAL: <span class='red'>$" + typeByState[1] + "</span></h4>"
    content += "<em>Click for a breakdown of all NAL actions.</em>";
    if (action == "click") {
      content += getActionDetails(state, type);
    }
  } else if (type == "NOUO") {
    content += "<h2>Pirate NOUO action details in " + actionDetails.statename + ":</h2>";
    content += "<h4>Total pirate NOUO action cases: <span class='red'>" + typeByState[2] + "</span></h4>";
    content += "<em>Click for a breakdown of all NOUO actions.</em>";
    if (action == "click") {
      content += getActionDetails(state, type);
    }
  } else if (type == "FO") {
    content += "<h2>Pirate Forfeiture Order action details in " + actionDetails.statename + ":</h2>";
    content += "<h4>Total pirate Forfeiture Order action cases: <span class='red'>" + typeByState[4] + "</span></h4>";
    content += "<h4>Total amount of Forfeiture Order: <span class='red'>$" + typeByState[5] + "</span></h4>"
    content += "<em>Click for a breakdown of all Forfeiture Order actions.</em>";
    if (action == "click") {
      content += getActionDetails(state, type);
    }
  } else if (type == "OTHER") {
    var totalNum = typeByState[6] + typeByState[8] + typeByState[10] + typeByState[12];
    var totalAmount = typeByState[7] + typeByState[9] + typeByState[11] + typeByState[13];
    content += "<h2>Pirate Other type action details in " + actionDetails.statename + ":</h2>";
    content += "<h4>Total pirate Other type action cases: <span class='red'>" + totalNum + "</span></h4>";
    content += "<h4>Total amount of Other type: <span class='red'>$" + totalAmount + "</span></h4>"
    content += "<em>Click for a breakdown of all Other type actions.</em>";
    if (action == "click") {
      content += getActionDetails(state, type);
    }
  }

  return content;
}

function getTypeByState(state) {
  var typeByState = [];
  var nalNum = 0,
    nalAmount = 0,
    nouoNum = 0,
    nouoAmount = 0,
    forfNum = 0;
  forfAmount = 0, mooNum = 0, mooAmount = 0, ocdNum = 0, ocdAmount = 0,novNum=0,novAmount=0,erratumNum=0,erratumAmount=0;
  var features = data;
  for (i = 0; i < features.length; i++) {
    if (features[i].state == state) {
      if (features[i].actiontype == "NAL") {
        nalNum++;
        nalAmount += features[i].amount;
      } else if (features[i].actiontype == "NOUO") {
        nouoNum++;
        nouoAmount += features[i].amount;
      } else if (features[i].actiontype == "FO") {
        forfNum++;
        forfAmount += features[i].amount;
      } else if (features[i].actiontype == "M.O.&O.") {
        mooNum++;
        mooAmount += features[i].amount;
      } else if (features[i].actiontype == "CD") {
        ocdNum++;
        ocdAmount += features[i].amount;
      }
        else if (features[i].actiontype == "NOV") {
        novNum++;
        novAmount += features[i].amount;
      }
        else if (features[i].actiontype == "ERRATUM") {
        erratumNum++;
        erratumAmount += features[i].amount;
      }

    }
  }
  typeByState.push(nalNum);
  typeByState.push(nalAmount);
  typeByState.push(nouoNum);
  typeByState.push(nouoAmount);
  typeByState.push(forfNum);
  typeByState.push(forfAmount);
  typeByState.push(mooNum);
  typeByState.push(mooAmount);
  typeByState.push(ocdNum);
  typeByState.push(ocdAmount);
  typeByState.push(novNum);
  typeByState.push(novAmount);
  typeByState.push(erratumNum);
  typeByState.push(erratumAmount);
  return typeByState;

}
function initTblSort() {
  if (jQuery('#tbl-actionDetails') && jQuery('#tbl-actionDetails tbody tr').length > 1) {
    jQuery('#tbl-actionDetails').dataTable({
      "aoColumns": [
      null, null, null,null,
      {
        "sType": "currency"
      },
      null],
      "aaSorting": [
        [1, "desc"]
      ],
      "bDestroy": true,
      "bFilter": false,
      "bInfo": false,
      "bPaginate": false,
      "bLengthChange": false
    });
  }
}

function showSubCatTableContent(type){
 $('#tooltips').html('');
  var num = 0;
  var amount=0;
  var content = "";
  if (type == "all"){
      return content;
    }
  var features = data;
  for (i = 0; i < features.length; i++) {
      if (type == "OTHER"){
        if (features[i].actiontype == "M.O.&O." || 
                features[i].actiontype == "CD" ||
                features[i].actiontype == "NOV" ||
                features[i].actiontype == "ERRATUM") {
            num++;
            amount += features[i].amount;
        }
      }
      else{
           if (features[i].actiontype == type) {
             num++;
             amount += features[i].amount;
           }
      }
  }
  content += "<h2>Pirate " + caseTypeName[type] +" action details in United State</h2>";
  content += "<h4>Total pirate " + caseTypeName[type] + " action cases: <span class='red'>" + num + "</span></h4>";
  content += "<h4>Total amount of " + caseTypeName[type] + ": <span class='red'>$" + amount + "</span></h4>";

  return content;
}

function getActionDetails(state, type) {
  console.log(state + " " + type)
  var content = "";
  var features = data;
  if (type == "all"){
    return content;
  }

  //console.log(state,dataType);
  if (state != "allstates"){
    content += "<table id='tbl-actionDetails' class='tablesorter'><thead><tr><th><div class='sort-wrapper'>File &nbsp;<span class='sort'></span></div></th><th><div class='sort-wrapper'>Date &nbsp;<span class='sort'></span></div></th><th><div class='sort-wrapper'>Name &nbsp;<span class='sort'></span></div></th><th><div class='sort-wrapper'>City &nbsp;<span class='sort'></span></div></th><th><div class='sort-wrapper'>Amt. &nbsp;<span class='sort'></span></div></th><th>URL</th></tr></thead>";
     if (type != "OTHER"){
       for (i = 0; i < features.length; i++) {
            if (features[i].state == state && features[i].actiontype == type) {
              content += "<tr><td>" + features[i].caseno + "</td>";
              content += "<td>" + format(features[i].date) + "</td>";
              content += "<td>" + features[i].casename + "</td>";
              content += "<td>" + features[i].city + "</td>";
              content += "<td>$" + features[i].amount + "</td>";
              content += "<td><a href='" + features[i].url + "' target='_blank'>link</a></td></tr>";
            }
        } 
     }
     else{
       for (i = 0; i < features.length; i++) {
            if (features[i].state == state && features[i].actiontype != "NAL" && features[i].actiontype != "NOUO" && features[i].actiontype != "FO") {
              content += "<tr><td>" + features[i].caseno + "</td>";
              content += "<td>" + format(features[i].date) + "</td>";
              content += "<td>" + features[i].casename + "</td>";
              content += "<td>" + features[i].city + "</td>";
              content += "<td>$" + features[i].amount + "</td>";
              content += "<td><a href='" + features[i].url + "' target='_blank'>link</a></td></tr>";
            }
        } 
      }
  }
  else{
      content += "<table id='tbl-actionDetails' class='tablesorter'><thead><tr><th><div class='sort-wrapper'>File &nbsp;<span class='sort'></span></div></th><th><div class='sort-wrapper'>Date &nbsp;<span class='sort'></span></div></th><th><div class='sort-wrapper'>Name &nbsp;<span class='sort'></span></div></th><th><div class='sort-wrapper'>State &nbsp;<span class='sort'></span></div></th><th><div class='sort-wrapper'>Amt. &nbsp;<span class='sort'></span></div></th><th>URL</th></tr></thead>";
     if (type != "OTHER"){
       for (i = 0; i < features.length; i++) {
            if (features[i].actiontype == type) {
              content += "<tr><td>" + features[i].caseno + "</td>";
              content += "<td>" + format(features[i].date) + "</td>";
              content += "<td>" + features[i].casename + "</td>";
              content += "<td>" + features[i].state + "</td>";
              content += "<td>$" + features[i].amount + "</td>";
              content += "<td><a href='" + features[i].url + "' target='_blank'>link</a></td></tr>";
            }
        } 
     }
     else{
       for (i = 0; i < features.length; i++) {
            if (features[i].actiontype != "NAL" && features[i].actiontype != "NOUO" && features[i].actiontype != "FO") {
              content += "<tr><td>" + features[i].caseno + "</td>";
              content += "<td>" + format(features[i].date) + "</td>";
              content += "<td>" + features[i].casename + "</td>";
              content += "<td>" + features[i].state + "</td>";
              content += "<td>$" + features[i].amount + "</td>";
              content += "<td><a href='" + features[i].url + "' target='_blank'>link</a></td></tr>";
            }
        } 
      }
  }
  
 content += "</table>";
 return content;
}


$(document).ready(function () {
  $('.description').hide();
  $('#description-all').show();

  // Layer Selection
  jQuery('a.candidate-tab').click(function (e) {
    currentType = jQuery(this).attr('id');
    e.preventDefault();

    jQuery('a.candidate-tab').removeClass('active');
    jQuery(this).addClass('active');

    jQuery('.description').hide();
    jQuery('#description-' + currentType).show();

    drawCircle(currentType);
   
    $('#tooltips').html('<div class="inner">' + showSubCatTableContent(currentType)+ '</div>');
     var actionD = getActionDetails("allstates", currentType);
      jQuery('#tooltips .inner').append('<div id="sect-actionDetails">'+ actionD + '</div>');
    initTblSort();    
  });

  jQuery('#tooltips').on('click', '.lnk-actionDetails', function (e) {
    var actionD = getActionDetails(actionDetails.state, jQuery(this).attr('id'));    
    e.preventDefault();
    jQuery('#sect-actionDetails').remove();
    jQuery('#tooltips .inner').append('<div id="sect-actionDetails"><h2>' +  jQuery(this).text() + ' Cases in ' + actionDetails.statename + '</h2>' + actionD + '</div>');
    initTblSort();
  });
});



