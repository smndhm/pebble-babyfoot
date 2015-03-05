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

Settings.data('team_home', {id: 1, name: 'The A Team'});
Settings.data('team_visitor', {id: 2, name: 'Les Losers'});

console.log('[SETTINGS DATAS]', JSON.stringify(Settings.data(), null, 2));

var team_home = Settings.data('team_home');
var team_visitor = Settings.data('team_visitor');

/* Main Menu */

var mainMenu = new UI.Menu({
  sections: [{
    items: [
      {
        title: 'Start Game',
        subtitle: 'VS ' + team_visitor.name,
        icon: 'images/baby-foot-start-game.pbl.png'
      }/*,
      {title: 'History'},
      {title: 'Options'}*/
    ]
  }]
});

mainMenu.on('select', function(e) {
  console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
  if (e.itemIndex === 0) { //Start Game
    ajax(
      {
        url: application.ajax.url + 'game?team_id_home=' + team_home.id + '&team_id_visitor=' + team_visitor.id,
        type: application.ajax.type,
        method: 'post'
      },
      function(data, status, request) {
        console.log('[AJAX SUCCESS]', status, JSON.stringify(data, null, 2));
        if(!data.error) {
          Settings.data('game_id', data.game);
          gwTextScoreHome.text('0');
          gwTextScoreVisitor.text('0');
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

var gwTextTeamHome = new UI.Text({
  position: new Vector2(4,55),
  size: new Vector2(136,24),
  textAlign: 'center',
  text: team_home.name
});

var gwTextTeamVisitor = new UI.Text({
  position: new Vector2(4,79),
  size: new Vector2(136,24),
  textAlign: 'center',
  text: team_visitor.name
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
  updateScore(team_home.id, 0);
});

//team #2 point
gameWindow.on('click', 'down', function() {
  updateScore(team_visitor.id, 0);
});

var gamelle_team_id;

//team #1 gamelle !
gameWindow.on('longClick', 'up', function() {
  gamelle_team_id = team_home.id;
  gamelleMenu.show();
});

//team #2 gamelle !
gameWindow.on('longClick', 'down', function() {
  gamelle_team_id = team_visitor.id;
  gamelleMenu.show();
});

/* Gamelle Menu */

var gamelleMenu = new UI.Menu({
  sections: [{
    title: 'Gamelle !',
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
gameWindow.add(gwTextTeamHome);
gameWindow.add(gwTextScoreVisitor);
gameWindow.add(gwTextTeamVisitor);
gameWindow.add(gwRect);