import $$ from 'dom7';
import Framework7 from 'framework7/framework7.esm.bundle.js';

// Import F7 Styles
import 'framework7/css/framework7.bundle.css';

// Import Icons and App Custom Styles
import '../css/icons.css';
import '../css/app.css';
// Import Cordova APIs
import cordovaApp from './cordova-app.js';
// Import Routes
import routes from './routes.js';

var app = new Framework7(
{
	root: '#app', // App root element
	id: 'id.harnic.courier', // App bundle ID
	name: 'Harnic Courier', // App name
	theme: 'auto', // Automatic theme detection
	// App root data
	data: function ()
	{
		return {
			user:
			{
				firstName: 'John',
				lastName: 'Doe',
			},

		};
	},
	// App root methods
	methods:
	{
		helloWorld: function ()
		{
			app.dialog.alert('Hello World!');
		},
	},
	// App routes
	routes: routes,


	// Input settings
	input:
	{
		scrollIntoViewOnFocus: Framework7.device.cordova && !Framework7.device.electron,
		scrollIntoViewCentered: Framework7.device.cordova && !Framework7.device.electron,
	},
	// Cordova Statusbar settings
	statusbar:
	{
		iosOverlaysWebView: true,
		androidBackgroundColor: '#ffffff'
	},
	on:
	{
		init: function ()
		{
			var f7 = this;
			if (f7.device.cordova)
			{
				// Init cordova APIs (see cordova-app.js)
				cordovaApp.init(f7);
			}
		},
	},
});

//INIT PAGE

$$(document).on('page:init', '.page[data-name="dashboard"]', function (e)
{
	var datalogin = app.form.getFormData('#login-info');
	var user = app.form.getFormData('#auth-info');
	console.log('DATA' + user);

	if (!datalogin && !user)
	{
		// console.log('Disini');
		app.loginScreen.open('#login-screen');
	}
	else
	{
		console.log(user.kurir_id);
		$$('#kurir_nama').text(user.kurir_nama);
		// getPick(user.kurir_id);
		getPick(3);
		
		//PICKUP
		$$('#pickup').on('click', function ()
		{
			// alert();
			var resi = $$('#pengiriman [name="resi"]').val();
			var action = 0;
			var token = user.token;
			// alert(resi+action+token);

			app.preloader.show();

			app.request(
			{
				url: 'https://api.harnic.id/courier/createLog',
				method: 'POST',
				timeout: 30000,
				contentType: 'application/x-www-form-urlencoded',
				headers:
				{
					token: token
				},
				data:
				{
					kurir_id: user.kurir_id,
					resi: resi,
					action: action
				},
				success: function (data)
				{
					$$('#resi').val('');
					app.preloader.hide();
					var d = JSON.parse(data);
					app.dialog.alert(d.message, 'System Alert');
					getPick(user.kurir_id);
				},
				error: function (xhr, ajaxOptions, thrownError)
				{ // Ketika ada error
					console.log(xhr.responseText);
				}
			});
		});

		$$('#refresh').on('click', function ()
		{
			getPick(user.kurir_id);
		});



		//RECEIVED
		$$('#received').on('click', function ()
		{
			capturePhoto();
			// var resi = $$('#pengiriman [name="resi"]').val();
			// var token = user.token;

			// app.preloader.show();
			// if (resi != '') {
			//   app.preloader.hide();
			//   // window.location.href = 'https://api.harnic.id/courier/customerReceived/' + resi + '/' + token;

			//    navigator.app.loadUrl('https://api.harnic.id/courier/customerReceived/' + resi + '/' + user.kurir_id, {openExternal : true})

			//   // if (window.cordova) {
			//   //   navigator.camera.getPicture(cameraSuccess, cameraError, cameraOptions);
			//   //  );
			//   // }

			// }else{
			//   app.preloader.hide();
			//   app.dialog.alert('Masukkan Nomor Resi','System Alert');
			// }
		});




		var pictureSource; // picture source
		var destinationType; // sets the format of returned value

		document.addEventListener("deviceready", onDeviceReady, false);
		document.addEventListener("backbutton", onBackKeyDown, false);
		
		function onBackKeyDown() {
			navigator.app.exitApp();
		}

		function onDeviceReady()
		{
			pictureSource = navigator.camera.PictureSourceType;
			destinationType = navigator.camera.DestinationType;
		}

		function clearCache()
		{
			navigator.camera.cleanup();
		}

		var retries = 0;

		function onCapturePhoto(fileURI)
		{
			var win = function (r)
			{
				app.preloader.hide();
				clearCache();
				retries = 0;
				alert(r.response);
			}

			var fail = function (error)
			{
				app.preloader.hide();
				if (retries == 0)
				{
					retries++
					setTimeout(function ()
					{
						onCapturePhoto(fileURI)
					}, 1000)
				}
				else
				{
					retries = 0;
					clearCache();
					alert('Ups. Something wrong happens!');
				}
			}


			var options = new FileUploadOptions();
			var resi = document.getElementById('resi').value;
			var parameters = {};
			parameters.resi = resi;
			parameters.courier = user.kurir_id;

			options.fileKey = "file";
			options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
			options.mimeType = "image/jpeg";
			options.params = parameters; // if we need to send parameters to the server request
			var ft = new FileTransfer();
			ft.onprogress = function(progressEvent) {
				app.preloader.show();
			};
			ft.upload(fileURI, encodeURI("https://api.harnic.id/courier/uploadBukti/"), win, fail, options);
		}

		function capturePhoto()
		{
			navigator.camera.getPicture(onCapturePhoto, onFail,
			{
				quality: 20,
				destinationType: destinationType.FILE_URI,
				cameraDirection: 0
			});
		}

		function onFail(message)
		{
			alert('Failed because: ' + message);
		}












		

		//SCAN
		$$('#scan').on('click', function ()
		{
			if ($$(this).val() == 'asd13asd12asd31asdas3f1asf31af')
			{
				alert(1);
			}
			if (window.cordova)
			{
				cordova.plugins.barcodeScanner.scan(
					function (result)
					{
						document.getElementById('resi').value = result.text;
					},
					function (error)
					{
						alert("Scanning failed: " + error);
					}
				);
			}

		});
	}






	$$('#login').on('click', function ()
	{
		var contact = $$('#login-info [name="contact"]').val();
		var password = $$('#login-info [name="password"]').val();
		if (contact != "" && password != "")
		{
			app.preloader.show();
			//API LOGIN
			app.request.post('https://api.harnic.id/c/login',
			{
				contact: contact,
				password: password
			}, function (data)
			{

				// console.log(data);

				var json = JSON.parse(data);

				// console.log(json.success);

				if (json.success == true)
				{

					app.form.storeFormData('#login-info',
					{
						'contact': contact,
						'password': password
					});

					app.form.storeFormData('#auth-info',
					{
						'kurir_id': json.kurir_id,
						'kurir_nama': json.kurir_nama,
						'token': json.token
					});


					$$('#kurir_nama').text(json.kurir_nama);
					getPick(json.kurir_id);
					app.preloader.hide();
					app.loginScreen.close('#login-screen');

				}
				else
				{
					app.preloader.hide();
					var toastWithButton = app.toast.create(
					{
						text: "Login Error",
						closeButton: true,
					});
					toastWithButton.open();
				}
			});

		}
		else
		{
			var toastWithButton = app.toast.create(
			{
				text: 'Masukkan data login anda',
				closeButton: true,
			});
			toastWithButton.open();
		}
	});

	//LOGOUT
	$$('#logout').on('click', function ()
	{
		// console.log('Bye');
		app.form.removeFormData('#login-info');
		app.form.removeFormData('#auth-info');
		app.loginScreen.open('#login-screen');
		console.log('Berhasil keluar');
	});

	function getPick(courier_id)
	{
		app.request(
		{
			url: 'https://api.harnic.id/courier/getCourierPick/' + courier_id,
			method: 'GET',
			success: function (data)
			{
				var d = JSON.parse(data);
				// console.log(d.length);

				$$('#total_pickedup').text(d.length);
				$$('#pickedup').html('');
				d.forEach(el =>
				{
					// console.log(el);
					$$('#pickedup').append('<li class="accordion-item">\
                <a href="" class="item-link item-content">\
                    <div class="item-inner">\
                        <div class="item-title">' + el.province + '/' + el.city + '</div>\
                    </div>\
                </a>\
                <div class="accordion-item-content">\
                  <div class="card">\
                    <div class="card-content card-content-padding">\
                      <strong>' + el.customer + '</strong><br>\
                      ' + el.phone + '\
                      <p>' + el.addr + ',' + el.city + ',' + el.province + '</p>\
                    </div>\
                  </div>\
                </div>\
            </li>');
				});
			},
			error: function (xhr, ajaxOptions, thrownError)
			{ // Ketika ada error
				console.log(xhr.responseText);
			}
		});
	}
});

$$(document).on('page:init', '.page[data-name="cod"]', function (e)
{
	var datalogin = app.form.getFormData('#login-info');
	var user = app.form.getFormData('#auth-info');
	console.log(user.kurir_id);

	if (!datalogin && !user)
	{
		app.loginScreen.open('#login-screen');
	}
	else
	{
		getCOD(user.kurir_id);
		// getCOD(3);

		var trx_selected = [];
		var total_selected = 0;

		$$(".page").on("change", "input[name='trx']", function ()
		{
			trx_selected = [];
			total_selected = 0;
			$$("input[type=checkbox]:checked").each(function (i)
			{
				trx_selected.push(parseInt($$(this).attr('value')));
				total_selected = total_selected + parseInt($$(this).attr('net'));
			});

			$$("#total_selected").text(total_selected.toLocaleString('en'));
			$$("#total_selected2").text(total_selected.toLocaleString('en'));

			if (total_selected > 0)
			{
				$$("#setor_button").show();
			}
			else
			{
				$$("#setor_button").hide();
			}
		});
	}

	$$("#send_otp").click(function ()
	{
		var post_data = {'kurir_nama':user.kurir_nama,'trx_val':total_selected};
		app.request(
			{
				url: 'https://api.harnic.id/courier/collectCODOTP/' + user.kurir_id,
				method: 'POST',
				contentType: 'application/json',
				data: post_data,
				dataType: 'JSON',
				error: function (xhr, ajaxOptions, thrownError)
				{ // Ketika ada error
					console.log(xhr.responseText);
				}
			});
	});
	$$("#confirm_setor").click(function ()
	{
		$$("#setor_button").attr('disabled', true);
		app.preloader.show();

		var password = $$("#password").val();
		var post_data = {'password':password,'trx':trx_selected};
		// post_data.push({'password':password,'trx':trx_selected});

		app.request(
		{
			url: 'https://api.harnic.id/courier/collectCOD/' + user.kurir_id,
			method: 'POST',
			timeout: 10000,
			contentType: 'application/json',
			data: post_data,
			dataType: 'JSON',
			success: function (data)
			{
				console.log(data);
				var d = JSON.parse(data);
				if(d.success == true){
					app.preloader.hide();
					app.sheet.close('.confirm-pin');
					app.sheet.open('.confirm-success');
					trx_selected = [];
					total_selected = 0;
					$$("#setor_button").hide();
					getCOD(user.kurir_id);
				}else{
					app.preloader.hide();
					app.sheet.close('.confirm-pin');
					app.sheet.open('.confirm-error');
					setTimeout(function ()
					{
						app.sheet.close('.confirm-error');
						app.sheet.open('.confirm-pin');
					}, 1000);
				}
				
			},
			error: function (xhr, ajaxOptions, thrownError)
			{ // Ketika ada error
				console.log(xhr.responseText);
			}
		});
		
		// if (password == 1234)
		// {
		// 	setTimeout(function ()
		// 	{
		// 		app.preloader.hide();
		// 		app.sheet.close('.confirm-pin');
		// 		app.sheet.open('.confirm-success');
		// 	}, 1000);
		// }
		// else
		// {
		// 	setTimeout(function ()
		// 	{
		// 		app.preloader.hide();
		// 		app.sheet.close('.confirm-pin');
		// 		app.sheet.open('.confirm-error');
		// 		setTimeout(function ()
		// 		{
		// 			app.sheet.close('.confirm-error');
		// 			app.sheet.open('.confirm-pin');
		// 		}, 1000);
		// 	}, 1000);
		// }
	});

	function getCOD(courier_id)
	{
		$$('#nominal').hide();
		$$('#list_trx').hide();
		$$('#trx').html('');
		app.request(
		{
			url: 'https://api.harnic.id/courier/getCOD/' + courier_id,
			method: 'GET',
			success: function (data)
			{
				var d = JSON.parse(data);
        console.log(d);
        if(d.count > 0){
          $$("#nominal").show();
          $$("#list_trx").show();
          $$('#total').text(parseInt(d.total).toLocaleString('en'));
          d.trx.forEach(el =>
          {
            // console.log(el);
            $$('#trx').append('<li>\
            <label class="item-checkbox item-content">\
              <input type="checkbox" name="trx" value="' + el.salesid + '" net="' + el.net + '"/>\
              <i class="icon icon-checkbox"></i>\
              <div class="item-inner">\
                <div class="item-title-row">\
                  <div class="item-title"><b>' + el.trxno + '</b></div>\
                  <div class="item-after">' + el.trxdate + '</div>\
                </div>\
                <div class="item-subtitle">' + el.customer + '/Jakarta Utara</div>\
                <div class="item-text">Rp.' + parseInt(el.net).toLocaleString('en') + '</div>\
              </div>\
            </label>\
          </li>');
          });
        }else{
          $$('#all_finish').show();
        }
			},
			error: function (xhr, ajaxOptions, thrownError)
			{ // Ketika ada error
				console.log(xhr.responseText);
			}
		});
	}
});