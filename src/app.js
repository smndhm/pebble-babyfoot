/**
 * BABY FOOT PEBBLE PROJECT
 */

/*  */

var application = {
  ajax: {
    url: 'http://simon.duhem.fr/lab/baby-foot/',
    type: 'json'
  }
};

/* Requires */

var Settings = require('settings');
var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');

/* Settings */

Settings.option('team_id_home', 1);
Settings.option('team_id_visitor', 2);

console.log('[SETTINGS OPTIONS]', JSON.stringify(Settings.option(), null, 2));
console.log('[SETTINGS DATAS]', JSON.stringify(Settings.data(), null, 2));


/* Main Menu */

var mainMenu = new UI.Menu({
  sections: [{
    items: [
      {title: 'Start Game'},
      {title: 'History'},
      {title: 'Options'}
    ]
  }]
});

mainMenu.on('select', function(e) {
  console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
  if (e.itemIndex === 0) { //Start Game
    ajax(
      {
        url: application.ajax.url + 'game?team_id_home=' + Settings.option('team_id_home') + '&team_id_visitor=' + Settings.option('team_id_visitor'),
        type: application.ajax.type,
        method: 'post',
        cache: false,
        data: {
          team_id_home: Settings.option('team_id_home'),
          team_id_visitor: Settings.option('team_id_visitor')
        }
      },
      function(data, status, request) {
        console.log('[AJAX SUCCESS]', status, JSON.stringify(data, null, 2));
        if(!data.error) {
          Settings.data('game', data.game);
          gameWindow.show();
        }
      },
      function(error, status, request) {
        console.log('[AJAX ERROR]', status, JSON.stringify(error, null, 2));
      }
    );
  }
});

mainMenu.show();

/* Game Window */

var gameWindow = new UI.Window({
  fullscreen: true,
  scrollable: false
});

var gwTextScoreHome = new UI.Text({
  position: new Vector2(4,15),
  size: new Vector2(136,42),
  font: 'bitham-42-bold',
  textAlign: 'center',
  text: '0'
});

var gwTextScoreVisitor = new UI.Text({
  position: new Vector2(4,99),
  size: new Vector2(136,42),
  font: 'bitham-42-bold',
  textAlign: 'center',
  text: '0'
});

var gwRect = new UI.Rect({
  position: new Vector2(0,83),
  size: new Vector2(144,2),
  backgroundColor: 'white'
});

//team #1 point
gameWindow.on('click', 'up', function() {

});

//team #1 gamelle !
gameWindow.on('longClick', 'up', function() {

});

//team #1 point
gameWindow.on('click', 'down', function() {

});

//team #2 gamelle !
gameWindow.on('longClick', 'down', function() {

});

//add
gameWindow.add(gwTextScoreHome);
gameWindow.add(gwTextScoreVisitor);
gameWindow.add(gwRect);