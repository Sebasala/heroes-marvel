$(document).ready(function() {

	//VARIABLES
	var marvelAPIURI = "https://gateway.marvel.com/v1/public";
	var charactersPath = "/characters";
	var charactersURI = marvelAPIURI + charactersPath;

	var characterName = "";
	var characterDescription = "";
	var characterThumbnailPath = "";
	var characterThumbnailSrc = "";
	var characterFirstComicsList = [];
	var searchTerm = "";
	
	var $charactersContainer = $('.characters-container');
	var $characterTemplate = $('<li class="col character-container">' +
									'<section class="character">' +
										'<div class="row">' +
											'<div class="col">' +
												'<img class="character-thumbnail" src="" alt="">' +
											'</div>' +
											'<div class="col">' +
												'<h3 class="character-name"></h3>' +
												'<p class="character-description"></p>' +
												'<button>View more</button>' +
											'</div>' +
										'</div>' +
										'<div class="related-comics">' +
											'<h4>Related comics</h4>' +
											'<ul class="row">' +
											'</ul>' +
										'</div>' +
									'</section>' +
								'</li>');
	var $comicHTML = $('<li class="col"></li>');
	var $searchButton = $('#search-button');
	var $searchInput = $('#search-input');


	//FUNCIONES
	//Busqueda por defecto
	function searchDefault() {
		$.getJSON( charactersURI, {
			apikey: "b7d3e92174566cf327622bfd1a930a14",
			limit: 10,
			orderBy: "-modified"
		}, function( response ) {
			//Para cada resultado
			$.each(response.data.results, function(index, item) {
				showFoundCharacter(index, item);
			});	
		});
	}

	//Mostrar personajes encontrados
	function showFoundCharacter(index, item) {
		//Guardar el nombre
		characterName = item.name;
		
		//Guardar la descripción
		characterDescription = item.description;

		//Guardar ruta de la imagen
		characterThumbnailPath = item.thumbnail.path;

		//Guardar fuente de la imagen
		characterThumbnailSrc = characterThumbnailPath + '/standard_fantastic.' + item.thumbnail.extension

		//Crear lista con los 4 primeros comics de cada personaje
		characterFirstComicsList = [];
		$.each(item.comics.items, function(comicIndex, comicItem) {
			characterFirstComicsList.push(comicItem.name);
			if (comicIndex >= 3) {
				return false;
			}
		});

		//Agregar el nombre a la plantilla
		$characterTemplate.find('.character-name').html(characterName);

		//Agregar la descripción a la plantilla
		$characterTemplate.find('.character-description').html(characterDescription);

		//Agregar la imagen a la plantilla
		$characterTemplate.find('.character-thumbnail').attr('src', characterThumbnailSrc);			

		//Agregar comics de la lista a la plantilla
		//Para cada comic en la lista de primeros comics
		$.each(characterFirstComicsList, function(firstComicsIndex, firstComicsItem) {
			//Agregarlo a la plantilla
			$comicHTML.html(firstComicsItem);
			$characterTemplate.find('.related-comics ul').append($comicHTML.clone());
		});

		//Mostrar la plantilla en la páigna
		$characterTemplate.clone().appendTo($charactersContainer);

		//Reiniciar Related comics para el siguiente personaje
		$characterTemplate.find('.related-comics ul').html("");
	}

	//Buscar personajes
	function searchCharacters() {
		//Borrar contenido de búsquedas anteriores del html de la página
		$charactersContainer.html("");

		//Guardar los caracteres ingresados por el usuario en el campo de busqueda
		searchTerm = $searchInput.val();

		//Si el termino de busqueda está vacío
		if (searchTerm === "") {
			//Ejecutar la busqueda por defecto
			searchDefault();
		} else {
			//Buscar el termino de busqueda
			$.getJSON( charactersURI, {
				apikey: "b7d3e92174566cf327622bfd1a930a14",
				limit: 10,
				orderBy: "name",
				nameStartsWith: searchTerm
			}, function( response ) {
				//Para cada resultado
				$.each(response.data.results, function(index, item) {
					showFoundCharacter(index, item);
				});	
			});
		}	
	}


	//EVENTOS
	//CUANDO LA PÁGINA CARGE, CARGAR Y MOSTRAR LOS PRIMEROS 10 PERSONAJES
	searchDefault();

	//CUANDO SE HAGA UNA BUSQUEDA MOSTRAR LOS PRIMEROS 10 RESULTADOS DE PERSONAJES
	//Cuando se presione el botón buscar
	$searchButton.click(function() {
		//Buscar los personajes que cuyo nombre comienza con el termino de búsqueda
		searchCharacters();
	});

	//Al presionar enter en el cuadro de busqueda
	$searchInput.on('keyup', function (e) {
	    if (e.keyCode == 13) {
	        //Buscar los personajes
	        searchCharacters();
	    }
	});
});