$(document).ready(function() {

	//VARIABLES
	var marvelAPIURI = "https://gateway.marvel.com/v1/public";
	var charactersPath = "/characters";
	var charactersURI = marvelAPIURI + charactersPath;
	
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
	var characterName = "";
	var characterDescription = "";
	var characterThumbnailPath = "";
	var characterThumbnailSrc = "";
	var characterFirstComicsList = [];	

	//CUANDO LA PÁGINA CARGE, CARGAR Y MOSTRAR LOS PRIMEROS 10 PERSONAJES
	$.getJSON( charactersURI, {
		apikey: "b7d3e92174566cf327622bfd1a930a14",
		limit: 10,
		orderBy: "-modified"
	}, function( response ) {
		//Para cada resultado
		$.each(response.data.results, function(index, item) {
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
			
		});	
	});
});