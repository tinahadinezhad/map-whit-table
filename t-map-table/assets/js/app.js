function initializeMap(mapId, markerCoords){

    // --------------------------------map-------------------------------------

    const map = L.map(mapId,{
        center:markerCoords,
        zoom:10,
        scrollWheelZoom: false,
        doubleClickZoom: false 
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const customIcon = L.icon({
        iconUrl:'public/icons/squat-marker.svg', 
        iconSize: [32, 32],
        iconAnchor: [16, 32], 
        popupAnchor: [0, -32] 
    });

    map.on('click', function(e) {
        const { lat, lng } = e.latlng;
    
        L.marker([lat, lng], { icon: customIcon }).addTo(map)
            .bindPopup(`<b>مختصات:</b><br>Lat: ${lat.toFixed(5)}<br>Lng: ${lng.toFixed(5)}`)
            .openPopup();
    });
    

    map.setView(markerCoords, 15);  

    // ----------------------------------checkbox----------------------------------------

    $('#selectAll').prop('checked', false);
    $('#selectAll').on('change', function() {
        if ($(this).prop('checked')) {
            $('#coordinatesTable tbody input[type="checkbox"]').prop('checked', true);
        } else {
            $('#coordinatesTable tbody input[type="checkbox"]').prop('checked', false);
        }
    });

    $('#coordinatesTable').on('change', 'tbody input[type="checkbox"]', function() {
        let allChecked = $('#coordinatesTable tbody input[type="checkbox"]').length === $('#coordinatesTable tbody input[type="checkbox"]:checked').length;
        if (allChecked) {
            $('#selectAll').prop('checked', true);
        } else {
            $('#selectAll').prop('checked', false);
        }
    });

    function checkEmptyTable() {
        if ($('#coordinatesTable tbody tr').length === 0) {
            $('#emptyMessage').show(); 
        } else {
            $('#emptyMessage').hide(); 
        }
    }

// ------------------------------------------clickRowTable-----------------------------------

    map.on('click', function(e) {
        const { lat, lng } = e.latlng;

        console.log(`Latitude: ${lat}, Longitude: ${lng}`);

        // const rowCount = $('#coordinatesTable tr').length ;

        let tableRow=`
        <tbody class="custom-row">
        <tr>
        <td>
            <button class="btn deleteBtn">
                <i class="fas fa-trash-alt"></i>
            </button>

            <button class="btn editBtn">
                <i class="fas fa-pencil-alt"></i>
            </button>  
        </td>

        <td>${lat.toFixed(5)}</td>

        <td>${lng.toFixed(5)}</td>
        <td><input type="checkbox"></td>
        </tr>
        </tbody>`;

        $('#coordinatesTable').append(tableRow);  
        checkEmptyTable();

    });

    checkEmptyTable();

    // -------------------------------------deleteIcon-------------------------------------

    $(document).on('click','.deleteBtn', function(){

        const row = $(this).closest('tr');
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: "btn btn-success",
              cancelButton: "btn btn-danger"
            },
            buttonsStyling: false
          });

          swalWithBootstrapButtons.fire({
            title: "مطمئن هستید؟",
            text: "شما نمیتوانید بعد از حذف سطر دوباره آن را برگردانید",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "بله ",
            cancelButtonText: "خیر",
            reverseButtons: true
          }).then((result) => {
            if (result.isConfirmed) {
                row.remove(); 
              swalWithBootstrapButtons.fire({
                title: "حذف",
                text: "سطر حذف شد",
                icon: "success"
              });
            } else if (
              /* Read more about handling dismissals below */
              result.dismiss === Swal.DismissReason.cancel
            ) {
              swalWithBootstrapButtons.fire({
                title: "لغو شد",
                text: "فایل شما محفوظ است :)",
                icon: "error"
              });
            }
          });
    })

    $(document).on('click', '#deleteAllBtn', function() {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: "btn btn-success",
                cancelButton: "btn btn-danger"
            },
            buttonsStyling: false
        });

        swalWithBootstrapButtons.fire({
            title: "مطمئن هستید؟",
            text: "تمامی سطرها حذف خواهند شد و قابل بازگشت نخواهند بود",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "بله، حذف کن",
            cancelButtonText: "خیر، لغو کن",
            reverseButtons: true
        }).then((result) => {

            if (result.isConfirmed) {

                $('.custom-row').remove();
                swalWithBootstrapButtons.fire({
                    title: "حذف شد!",
                    text: "تمام سطرها حذف شدند.",
                    icon: "success"
                });

                checkEmptyTable();
             } else if (result.dismiss === Swal.DismissReason.cancel) {

                swalWithBootstrapButtons.fire({
                    title: "لغو شد",
                    text: "سطرها محفوظ ماندند :)",
                    icon: "error"
                });
            }
        });
    });

    checkEmptyTable();

// --------------------------------------editIconInModal--------------------------------------------------

    $(document).on('click', '.editBtn', function(){

        let row = $(this).closest('tr');

        let lat = row.find('td').eq(1).text();

        let lng = row.find('td').eq(2).text();

        $('#latInput').val(lat);
        $('#lngInput').val(lng);

        $('#latInput').data('initialValue', lat);
        $('#lngInput').data('initialValue', lng);

        $('#saveChangesBtn').data('row',row);
        $('#editModal').modal('show');

        checkEmptyTable();
    });

    $('#latInput, #lngInput').on('input', function(event) {

        this.value = this.value.replace(/[^0-9\.]/g, '');

        if (this.value.length > 7) {
            this.value = this.value.slice(0, 7); 
        }
    
        if (this.value.indexOf('.') !== -1) {
            let parts = this.value.split('.');
            if (parts[1] && parts[1].length > 5) {
                this.value = parts[0] + '.' + parts[1].substring(0, 5); 
            }
        }
    });

    $('#saveChangesBtn').on('click', function(){

        let row = $(this).data('row');

        let newLat = $('#latInput').val();
        let newLng = $('#lngInput').val();

        if (!newLat) {
            newLat = '-';
        } else {
            
            if (newLat.match(/[^0-9.]/) || (newLat.split('.').length > 2)) {

                Swal.fire({
                    icon: "error",
                    title: ";)",
                    text: "لطفاً فقط اعداد صحیح و اعشاری وارد کنید.",
                  });

                return; 
            }
            newLat = parseFloat(newLat).toFixed(5);
        }
    
        if (!newLng) {
            newLng = '-';
        } else {
            if (newLng.match(/[^0-9.]/) || (newLng.split('.').length > 2)) {

                Swal.fire({
                    icon: "error",
                    title: ";)",
                    text: "لطفاً فقط اعداد صحیح و اعشاری وارد کنید.",
                  });

                return; 
            }
            newLng = parseFloat(newLng).toFixed(5); 
        }

        row.find('td').eq(1).text(newLat);
        row.find('td').eq(2).text(newLng);

        $('#editModal').modal('hide');
    });

    $('#resetInitialBtn').on('click', function() {
        let initialLat = $('#latInput').data('initialValue');
        let initialLng = $('#lngInput').data('initialValue');
        
        $('#latInput').val(initialLat);
        $('#lngInput').val(initialLng);
    });

    $('#resetFormBtn').on('click', function() {
        $('#latInput').val('');
        $('#lngInput').val('');
    });

    $(document).on('keydown', function(event) {
        if (event.key === "Enter") {
            if ($('#editModal').hasClass('show')) {
                $('#saveChangesBtn').click(); 
            }
        }
    });

    // -------------------------------------------addRowTable----------------------------------------

    $(document).on('click', '#addRowBtn', function() {
        let inputRow = `
            <tbody class="custom-row">
            <tr>
                <td>
                    <button class="btn saveBtn">
                        <i class="fas fa-save"></i>
                    </button>
                </td>
                <td><input type="number" class="form-control latInput" placeholder="عرض جغرافیایی" step="any"></td>
                <td><input type="number" class="form-control lngInput" placeholder="طول جغرافیایی" step="any"></td>
                <td><input type="checkbox"></td>
            </tr>
            </tbody>`;
        
        $('#coordinatesTable').append(inputRow);
    });
    
// -------------------------------------saveCHangeAddRow-------------------------------------------

$(document).on('click', '.saveBtn', function() {
    let row = $(this).closest('tr');
    let lat = row.find('.latInput').val();
    let lng = row.find('.lngInput').val();

    if (lat && lng) {
        let tableRow = `
            <tbody class="custom-row">
                <tr>
                    <td>
                        <button class="btn deleteBtn">
                            <i class="fas fa-trash-alt"></i>
                        </button>

                        <button class="btn editBtn">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                    </td>
                    <td>${parseFloat(lat).toFixed(5)}</td>
                    <td>${parseFloat(lng).toFixed(5)}</td>
                    <td><input type="checkbox"></td>
                </tr>
            </tbody>`;

        $('#coordinatesTable').append(tableRow);
        row.remove();
        checkEmptyTable();

    } else {

        Swal.fire({
            icon: "error",
            title: "توجه",
            text: "لطفاً مختصات را وارد کنید!",
          });
    }
});


    // $(document).on('click', '.close, .btn-secondary', function() {
    //     $('#editModal').modal('hide');
    // });

}

initializeMap('myMap', [36.57954224652305, 53.04891501148663]);