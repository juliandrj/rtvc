var app = angular.module("anonimasApp", ['ui.bootstrap', 'dialogs', 'ngSanitize', 'ngRoute']);
var bucket = new AWS.S3({params: {Bucket: 'senalcolombia.tv/anonimas'}});
var host = 'http://series.senalcolombia.tv/';
//var host = 'http://172.19.5.55/series/';
var baseurl = 'http://senalcolombia.tv.s3.amazonaws.com/anonimas/';
var progreso = 0;
var loadingProgress = 0;
var salir = false;
var imageError = null;
var thumbs = new Array();
a2a_config = {
		linkname: 'Anonimas Extraordinarias',
		linkurl: 'http://anonimas.senalcolombia.tv/actividad/index.html'
};
app.directive('myYoutube', function($sce) {
	return {
		restrict: 'EA',
		scope: { code:'=' },
		replace: true,
		template: '<iframe  width="640" height="390" src="{{url}}" frameborder="0" allowfullscreen></iframe>',
		link: function (scope) {
			scope.$watch('code', function (newVal) {
				if (newVal) {
					scope.url = $sce.trustAsResourceUrl("http://www.youtube.com/embed/" + newVal);
				}
			});
		}
	};
});

app.config(function($routeProvider, $locationProvider) {
	$routeProvider
    .when(
        "/postulada/:nid", {
            action: "postulada"
        }
    )
    .otherwise({
    		action: "default"
        }
    );
});

function load($scope, $http, $dialogs) {
	var pasos = 5;
	progreso = 0;
	var dlg = $dialogs.wait('Cargando...', progreso);
	$http({method: 'POST', url: 'http://www.senalcolombia.tv/templates/senalcolombia-2013/recursos/menujson/jmenu.php'}).success(function(data) {
		$scope.menu = data;
		progreso += Math.ceil(100 / pasos);
	});
	$http({method: 'GET', url: host + '/services.sc/views/anonima.json?args[0]=all&args[1]=all&args[2]=all&args[3]=1'}).success(function(data) {
		$scope.destacadas = data;
		progreso += Math.ceil(100 / pasos);
	});
	$http({method: 'GET', url: host + '/services.sc/views/anonima.json'}).success(function(data) {
		$scope.anonimasTotal = data;
		if ($scope.anonimasTotal.length == 'undefined') {
			$scope.anonimasTotal = [data];
		}
		$scope.totalItems = $scope.anonimasTotal.length;
		$scope.anonimas = $scope.anonimasTotal.slice(0, $scope.anonimasTotal.length > $scope.itemsPerPage ? $scope.itemsPerPage : $scope.anonimasTotal.length);
		progreso += Math.ceil(100 / pasos);
	});
	$http({method: 'GET', url: host + '/services.sc/views/episode.json?args[0]=all&args[1]=1201'}).success(function(data) {
		$scope.tabs = data;
		for (var i = 0; i < $scope.tabs.length; i++) {
			$scope.tabs[i].active = (i == $scope.tabs.length - 1);
			if ($scope.tabs[i].videos && typeof $scope.tabs[i].videos !== 'Array' && $scope.tabs[i].videos != "") {
				$scope.tabs[i].videos = $scope.tabs[i].videos.split(",");
			}
		}
		progreso += Math.ceil(100 / pasos);
	});
	$http({method: 'GET', url: host + '/services.sc/views/departamentos.json'}).success(function(data) {
		$scope.deptos = data;
		progreso += Math.ceil(100 / pasos);
	});
}

function getConcursanteNode(user) {
	var node = new Object();
	node.title=user.name;
	node.type="concursante";
	node.status='0';
	node.field_apellidos =new Object();
	node.field_apellidos.und=new Array();
	node.field_apellidos.und[0]=new Object();
	node.field_apellidos.und[0].value=user.lastname;
	//---------------------------------------------
	node.field_documento =new Object();
	node.field_documento.und=new Array();
	node.field_documento.und[0]=new Object();
	node.field_documento.und[0].value=user.document;
	//---------------------------------------------
	node.field_tipo_documento=new Object();
	node.field_tipo_documento.und=new Object();
	node.field_tipo_documento.und.value=user.docType;
	//---------------------------------------------
	node.field_genero=new Object();
	node.field_genero.und=new Object();
	node.field_genero.und.value=user.gender;
	//---------------------------------------------
	node.field_email =new Object();
	node.field_email.und=new Array();
	node.field_email.und[0]=new Object();
	node.field_email.und[0].value=user.email;
	//---------------------------------------------
	node.field_direccion_contacto =new Object();
	node.field_direccion_contacto.und=new Array();
	node.field_direccion_contacto.und[0]=new Object();
	node.field_direccion_contacto.und[0].value=user.address;
	//---------------------------------------------
	node.field_telefono_contacto =new Object();
	node.field_telefono_contacto.und=new Array();
	node.field_telefono_contacto.und[0]=new Object();
	node.field_telefono_contacto.und[0].value=user.phone;
	//---------------------------------------------
	node.field_municipio=new Object();
	node.field_municipio.und=new Object();
	node.field_municipio.und.nid=user.county;
	//---------------------------------------------
	node.field_acepta_contacto =new Object();
	node.field_acepta_contacto.und=new Array();
	node.field_acepta_contacto.und[0]=new Object();
	node.field_acepta_contacto.und[0].value=user.agreeSend ? 1 : 0;
	return angular.toJson(node);
}

function getAnonimaNode(anonima, nid, doc, files) {
	var node = new Object();
	node.title=anonima.name;
	node.type="participante_mujeres_anonimas";
	node.status='0';
	//---------------------------------------------
	node.body=new Object();
	node.body.und=new Array();
	node.body.und[0]=new Object();
	node.body.und[0].value=anonima.postulation;
	//---------------------------------------------
	node.field_municipio=new Object();
	node.field_municipio.und=new Object();
	node.field_municipio.und.nid=anonima.county;
	//---------------------------------------------
	node.field_telefono_contacto=new Object();
	node.field_telefono_contacto.und=new Array();
	node.field_telefono_contacto.und[0]=new Object();
	node.field_telefono_contacto.und[0].value=anonima.contacto;
	//---------------------------------------------
	node.field_email=new Object();
	node.field_email.und=new Array();
	node.field_email.und[0]=new Object();
	node.field_email.und[0].value=anonima.contacto;
	//---------------------------------------------
	node.field_image_url=new Object();
	node.field_image_url.und=new Array();
	for (var n=0; n < files.length; n++) {
		node.field_image_url.und[n]=new Object();
		node.field_image_url.und[n].value=baseurl + makeFileName(doc, files[n], n);
	}
	//---------------------------------------------
	node.field_acepta_tyc=new Object();
	node.field_acepta_tyc.und=new Array();
	node.field_acepta_tyc.und[0]=new Object();
	node.field_acepta_tyc.und[0].value=anonima.agree ? 1 : 0;
	//---------------------------------------------
	node.field_concursante=new Object();
	node.field_concursante.und=new Object();
	node.field_concursante.und.nid=nid;
	return angular.toJson(node);
}

function almacenarParticipante($http, $scope, files) {
	$http({method: 'POST', url: host + '/services.sc/node', data: getConcursanteNode($scope.user), headers: {'Content-Type': 'application/json'}}).
	success(function(data, status, headers, config) {
		progreso += 20;
		$http({method: 'POST', url: host + '/services.sc/node', data: getAnonimaNode($scope.anonima, data.nid, $scope.user.document, files), headers: {'Content-Type': 'application/json'}}).
		success(function(data, status, headers, config) {
			progreso += 20;
			salir = true;
			$http({method: 'GET', url: host + '/services/thumbs?doc=' + $scope.user.document}).success(function(data) {
				console.log('Thumbs creados');
			});
		}).
		error(function(data, status, headers, config) {
			$scope.alerts.push({type: 'danger', msg: 'Registro no realizado: [(n2) ' + data + '] envie este mesaje a jrojas@rtvc.gov.co para solucionar el problema y poder tramitar su postulacion. Disculpe las molestias.'});
			progreso = 100;
		});
	}).
	error(function(data, status, headers, config) {
		$scope.alerts.push({type: 'danger', msg: 'Registro no realizado: [(n1) ' + data + '] envie este mesaje a jrojas@rtvc.gov.co para solucionar el problema y poder tramitar su postulacion. Disculpe las molestias.'});
		progreso = 100;
	});
}

function uploadImages($http, $scope, files, n) {
	if (n >= files.length) {
		almacenarParticipante($http, $scope, files);
	} else {
		if (files[n]) {
			if (files[n].type != 'image/jpeg' && files[n].type != 'image/png') {
				$scope.alerts.push({type: 'danger', msg: 'Tipo de archivo no valido: ' + files[i].type});
				progreso = 100;
			}
			var params = {Key: makeFileName($scope.user.document, files[n], n), ContentType: files[n].type, Body: files[n]};
			bucket.putObject(params, function (err, data) {
				if (err == null) {
					uploadImages($http, $scope, files, n + 1);
					progreso += 20;
				} else {
					$scope.alerts.push({type: 'danger', msg: 'No se logro cargar la imagen, intente nuevamente es unos minutos. ' + err});
					progreso = 100;
				}
			});
		} else {
			$scope.alerts.push({type: 'danger', msg: 'Falta una imagen.'});
			progreso = 100;
		}
	}
}

function makeFileName(doc, file, n) {
	return doc + '_' + n + '.' + (file.type == 'image/jpeg' ? 'jpg' : 'png');
}
