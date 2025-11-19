let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 18.9437984, lng: 76.5282043 },
    zoom: 6,
  });

  const locationButton = document.createElement("button");

  locationButton.textContent = "Around Me";
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(locationButton);
  locationButton.addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          map.setCenter(pos);
          map.setZoom(16);
        }
      );
    } else {
      // Browser doesn't support Geolocation
    }
  });
}

window.initMap = initMap;

$(window).on('load', function () {
  // sheetID you can find in the URL of your spreadsheet after "spreadsheet/d/"
  const sheetId = "1Yvhu2I5AJGw2w3Av6OxEWpl1QIC9mK9MBuOR0l_y22k";
  // sheetName is the name of the TAB in your spreadsheet (default is "Sheet1")
  const sheetName = encodeURIComponent("Sheet1");
  const sheetURL = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
  $.ajax({
    type: "GET",
    url: sheetURL,
    dataType: "text",
    success: function (response) {
      const positionData = $.csv.toObjects(response);
      console.log(positionData);
      const image = (pending) => {
        return {
          url: pending ? "./pendingIcon.png" : "./markerIcon.png",
          scaledSize: new google.maps.Size(20, 20)
        };
      };

      var marker;
      var infowindow = new google.maps.InfoWindow();
      for (let i = 0; i < positionData.length; i++) {
        marker = new google.maps.Marker({
          position: new google.maps.LatLng({
            lat: parseFloat(positionData[i].lat),
            lng: parseFloat(positionData[i].lng)
          }),
          map: map,
          icon: image(!positionData[i].conducted)
        });
        google.maps.event.addListener(marker, 'click', (function (marker, i) {
          var boxText = document.createElement("p");
          boxText.innerHTML = positionData[i].conducted ? `<p class="hook">
          <h3>${positionData[i].name || "Hospital Name Not Mentioned"}</h3>
        //  <div><b>Survey conducted by:</b> ${positionData[i].conducted || "IBWG"}</div>
          <div><b>Survey conducted on:</b> ${positionData[i].conducted_on || "No Time"}</div>
           <div><b>HCF TYPE:</b> ${positionData[i].hcftype || "No Time"}</div>
          <div><b>Address:</b> ${positionData[i].address || "Private address"}</div>
          </p>` : `<p class="hook">
          <h3>${positionData[i].name || "Hospital Name Not Mentioned"}</h3>
          <div><b>Address:</b> ${positionData[i].address || "Private address"}</div>
          <h4>Register HCF</h4>
          </p>`;
          return function () {
            infowindow.setContent(boxText);
            infowindow.open(map, marker);
          }
        })(marker, i));
      }
      marker.setMap(map);
    },
  });
});

