function municipios($scope, $http) {
	agregarMunicipio($http, 0);
	$scope.mcipios = new Array();
}
function agregarMunicipio($http, i) {
	if (i >= ms.length) {
		return;
	}
	var mcipioObj = new Object();
	mcipioObj.cod_depto=ms[i][0];
	mcipioObj.depto=ms[i][1];
	var node = new Object();
	node.title=ms[i][1];
	node.type="municipio";
	node.field_cod_municipio =new Object();
	node.field_cod_municipio.und=new Array();
	node.field_cod_municipio.und[0]=new Object();
	node.field_cod_municipio.und[0].value=ms[i][0];
	//---------------------------------------------
	node.field_logitud=new Object();
	node.field_logitud.und=new Array();
	node.field_logitud.und[0]=new Object();
	node.field_logitud.und[0].value=ms[i][2];
	//---------------------------------------------
	node.field_latitud=new Object();
	node.field_latitud.und=new Array();
	node.field_latitud.und[0]=new Object();
	node.field_latitud.und[0].value=ms[i][3];
	//---------------------------------------------
	node.field_departamento=new Object();
	node.field_departamento.und=new Object();
	node.field_departamento.und.nid=ms[i][4];
	$http({method: 'POST', url: 'http://series.senalcolombia.tv/services.sc/node', data: angular.toJson(node), headers: {'Content-Type': 'application/json'}}).
	success(function(data, status, headers, config) {
		console.log(data.nid+','+ms[i][0]+','+ms[i][1]);
		agregarMunicipio($http, i+1);
	}).
	error(function(data, status, headers, config) {
		console.log("ERROR: " + data);
	});
}