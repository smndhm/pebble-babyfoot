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
        method: 'post'
      },
      function(data, status, request) {
        console.log('[AJAX SUCCESS]', status, JSON.stringify(data, null, 2));
        if(!data.error) {
          Settings.data('game_id', data.game);
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

var updateScore = function(team_id, gamelle) {
  ajax(
    {
      url: application.ajax.url + 'goal?game_id=' + Settings.data('game_id') + '&team_id=' + team_id + '&gamelle=' + gamelle,
      type: application.ajax.type,
      method: 'post'
    },
    function(data, status, request) {
      console.log('[AJAX SUCCESS]', status, JSON.stringify(data, null, 2));
      if(!data.error) {
        gwTextScoreHome.text(data.score.home);
        gwTextScoreVisitor.text(data.score.visitor);
      }
    },
    function(error, status, request) {
      console.log('[AJAX ERROR]', status, JSON.stringify(error, null, 2));
    }
  );
};

//team #1 point
gameWindow.on('click', 'up', function() {
  updateScore(Settings.option('team_id_home'), 0);
});

//team #2 point
gameWindow.on('click', 'down', function() {
  updateScore(Settings.option('team_id_visitor'), 0);
});

var gamelle_team_id;

//team #1 gamelle !
gameWindow.on('longClick', 'up', function() {
  gamelle_team_id = Settings.option('team_id_home');
  gamelleMenu.show();
});

//team #2 gamelle !
gameWindow.on('longClick', 'down', function() {
  gamelle_team_id = Settings.option('team_id_visitor');
  gamelleMenu.show();
});

/* Gamelle Menu */

var gamelleMenu = new UI.Menu({
  sections: [{
    items: [
      {title: 'Take the point'},
      {title: 'Remove the point'}
    ]
  }]
});

gamelleMenu.on('select', function(e) {
  console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
  if (e.itemIndex === 0) { //Take the point
    updateScore(gamelle_team_id, 1);
    gamelleMenu.hide();
  }
  else if (e.itemIndex === 1) { //Remove the point
    updateScore(gamelle_team_id, -1);
    gamelleMenu.hide();
  }
});

//add
gameWindow.add(gwTextScoreHome);
gameWindow.add(gwTextScoreVisitor);
gameWindow.add(gwRect);