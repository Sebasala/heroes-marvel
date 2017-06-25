$(document).ready(function() {

	//VARIABLES
	var marvelAPIURI = "https://gateway.marvel.com/v1/public";
	var charactersPath = "/characters";
	var charactersURI = marvelAPIURI + charactersPath;
	var characterComicsURI = ""; 

	var characterId = 0;
	var characterName = "";
	var characterDescription = "";
	var characterThumbnailPath = "";
	var characterThumbnailSrc = "";
	var characterFirstComicsList = [];
	var searchTerm = "";
	var orderVal = "-modified";
	var comicTitle = "";
	var comicsList = [];
	
	var $charactersContainer = $('.characters-container');
	var $characterTemplate = $('<li class="col character-container">' +
									'<section class="character">' +
										'<div class="row">' +
											'<div class="col">' +
												'<img class="character-thumbnail" src="" alt="">' +
											'</div>' +
											'<div class="col character-details">' +
												'<h3 class="character-name"></h3>' +
												'<p class="character-description"></p>' +
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
	var $orderSelect = $('#sort-by');
	var $viewMoreButton = $('<button>View more</button>');
	var $relatedComics;
	var $character;

	//FUNCIONES
	//Agregar botones de ver mas
	function addViewMoreButtons() {
		$('.character-details').each( function() {
			$viewMoreButton.clone(true).appendTo($(this));  //clone(true) clona también los metodos asociados como .click por ejemplo
		});
	}

	//Busqueda por defecto
	function searchDefault() {
		$.getJSON( charactersURI, {
			apikey: "b7d3e92174566cf327622bfd1a930a14",
			limit: 10,
			orderBy: orderVal
		}, function( response ) {
			//Para cada resultado
			$.each(response.data.results, function(index, item) {
				showFoundCharacter(index, item);
			});

			//Agregar botones de ver mas
			addViewMoreButtons();
		});
	}

	//Mostrar personajes encontrados
	function showFoundCharacter(index, item) {
		
		//Guardar id del personaje
		characterId = item.id;
		
		//Agregar id como dato al personaje
		$characterTemplate.find('.character').data("characterId", characterId);

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
		$characterTemplate.clone(true).appendTo($charactersContainer);

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
				orderBy: orderVal,
				nameStartsWith: searchTerm
			}, function( response ) {
				//Para cada resultado
				$.each(response.data.results, function(index, item) {
					showFoundCharacter(index, item);
				});

				//Agregar botones de ver mas
				addViewMoreButtons();
			});
		}	
	}

	//Alternar comics cargados
	function toggleLoadedComics($character) {
		//Para cada comic de la lista de comics
		$character.find('.related-comics li').each( function () {
			//Si está visible
			if ($(this).is(":visible")) {
				//Ocultarlo
				$(this).hide();
			} else {
				//Mostrarlo
				$(this).show();
			}
		});		
	}

	//Expandir personaje
	function expandCharacter($character) {
		//Minimizar todos los personajes expandidos
		//Para cada personaje
		$('.character').each( function () {
			//Si está expandido
			if ($(this).hasClass('expanded')) {
				//Minimizarlo
				minCharacter($(this));
			}
		});

		//Alternar comics cargados
		toggleLoadedComics($character);

		//Guardar el ul de los comics relacionados
		$relatedComics = $character.find('.related-comics ul');

		//Guardar el id del personaje
		characterId = $character.first().data('characterId');
		
		//Crear URI de los comics del personaje
		characterComicsURI = charactersURI + "/" + characterId + "/comics";

		//Crear una lista con los títulos de los últimos comics asociados al personaje
		//Si no se han cargado todos los comics para este personaje
		if (!$character.hasClass('loaded')) {
			//Cargarlos
			$.getJSON( characterComicsURI, {
				apikey: "b7d3e92174566cf327622bfd1a930a14",
				orderBy: "-modified"
			}, function( response ) {
				//Para cada resultado
				$.each(response.data.results, function(index, item) {
					//Agregar el titulo del comic a la lista de related comics
					//Guardar titulo del comic
					comicTitle = item.title;

					//Agregar el título a la ul de related comics
					$relatedComics.append('<li class="col">' + comicTitle + '</li>');
				});

				//Marcar el personaje como cargado para no volver a cargar los datos de nuevo
				$character.addClass('loaded');
			});
		}

		//Cambiar texto del botón por "view less"
		$character.find('button').html('View less');

		//Agregar clase expanded al personaje
		$character.addClass('expanded');
	}

	//Minimizar personaje
	function minCharacter($character) {
		//Alternar comics cargados
		toggleLoadedComics($character);

		//Remover clase expanded al personaje
		$character.removeClass('expanded');

		//Cambiar texto del botón por "view more"
		$character.find('button').html('View more');
	}

	//Alternar personaje
	function toggleCharacter($character) {
		//Si el personaje está expandido
		if ($character.hasClass('expanded')) {
			//Minimizarlo
			minCharacter($character);
		} else {
			//Expandirlo
			expandCharacter($character);
		}	
	}


	//EVENTOS
	//CUANDO LA PÁGINA CARGE, CARGAR Y MOSTRAR LOS PRIMEROS 10 PERSONAJES
	searchDefault();

	//CUANDO SE HAGA UNA BUSQUEDA MOSTRAR LOS PRIMEROS 10 RESULTADOS DE PERSONAJES
	//Cuando se presione el botón buscar
	$searchButton.click(function(event) {
		//Buscar los personajes que cuyo nombre comienza con el término de búsqueda
		searchCharacters();
	});

	//Al presionar enter en el cuadro de busqueda
	$searchInput.on('keyup', function (e) {
	    if (e.keyCode == 13) {
	        //Buscar los personajes
	        searchCharacters();
	    }
	});

	//AL SELECCIONAR UNA OPCIÓN PARA ORDENAR LOS RESULTADOS
	$orderSelect.change(function(event) {
		//Si el valor de option es valido
		if ($(this).val() != "" ) {
			orderVal = $(this).val();

			//Arrojar los resultados en ese orden
			searchCharacters();
		}
	});

	//AL HACER CLICK EN EL BOTÓN DE VER MAS
	$viewMoreButton.click( function() {
		//Guardar el personaje asociado al botón
		$character = $(this).parents('.character');

		//Expandir el personaje asociado al botón
		toggleCharacter($character);
	});
		
});