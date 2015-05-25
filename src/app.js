/****************************
      * BABY FOOT PEBBLE PROJECT *
      ****************************/

/* Application */

var application = {
  configurable: {
    url: 'http://simon.duhem.fr/lab/pebble-baby-foot/configurable'
  },
  scores: [5,10],
  ajax: {
    url: 'http://simon.duhem.fr/lab/pebble-baby-foot/',
    type: 'json'
  }
};

/* Text */

var text = {
  startGame: 'Start Game',
  history: 'History',
  options: 'Options',
  teams: 'Teams',
  home: 'Home',
  visitor: 'Visitor',
  scoring: 'Scoring',
  endScore: 'End score',
  pts: 'pts',
  endRule: 'End rule',
  onScore: 'On score',
  twoPointsDifference: 'Two points difference',
  withGamelle: 'With gamelle',
  yes: 'Yes',
  no: 'No',
  endOnGamelle: 'End on gamelle',
  negativeScore: 'Negative Score',
  gamelle: 'Gamelle!',
  take: 'Take',
  remove: 'Remove'
};

/* Requires */

var Settings = require('settings');
var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
var Vibe = require('ui/vibe');

/* Variables */

var pebbleAccountToken = Pebble.getAccountToken();

/* Infos */

if (Pebble.getActiveWatchInfo) {
  var pebbleActiveWatchInfo = Pebble.getActiveWatchInfo();
  console.log('#pebbleActiveWatchInfo', JSON.stringify(pebbleActiveWatchInfo, null, 2));
}

/* Configurable */

Settings.config(
  {
    url: application.configurable.url + '?account_token=' + pebbleAccountToken
  },
  function(e) {
    console.log('#configurable.opening', JSON.stringify(e, null, 2));
  },
  function(e) {
    console.error('#configurable.close', JSON.stringify(e, null, 2));
  }
);

/* Settings */
var forceDefault = false;
if (Settings.data('options')===undefined || forceDefault) {
  var defaultOptions = {
    teamHome: {},
    teamVisitor: {},
    endScore: application.scores[1],
    endRule: text.onScore,
    withGamelle: true,
    endOnGamelle: false,
    negativeScore: true
  };
  Settings.data('options', defaultOptions);
}

console.log('[SETTINGS DATAS]',   JSON.stringify(Settings.data(), null, 2));
console.log('[SETTINGS OPTIONS]', JSON.stringify(Settings.option(), null, 2));

var options = Settings.data('options');

/* JSON to params */

var JSONtoParams = function (data) {
  return Object.keys(data).map(function(k) {
    return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]);
  }).join('&');
};

/* Synchronise */



var Synchronize = function() {

  var actions = Settings.data('synchronize')===undefined || forceDefault ? [] : Settings.data('synchronize');

  this.startGame = function() {
    var gameOptions = JSON.parse(JSON.stringify(options));
    gameOptions.team_id_home = gameOptions.teamHome.id;
    delete gameOptions.teamHome;
    gameOptions.team_id_visitor = gameOptions.teamVisitor.id;
    delete gameOptions.teamVisitor;
    actions.push({
      action: 'game',
      options: gameOptions,
      time: new Date()
    });
    send();
  };

  this.goal = function(team, isGamelle) {
    actions.push({
      action: 'goal',
      options: {
        team: team.id,
        gamelle: isGamelle
      },
      time: new Date()
    });
    send();
  };

  var send = function() {
    Settings.data('synchronize', actions);
    if (actions.length > 0) {
      ajax(
        {
          url: application.ajax.url + 'post/' + actions[0].action + '?' + JSONtoParams(actions[0].options),
          type: application.ajax.type,
          headers: {
            'token': pebbleAccountToken,
            'time': actions[0].time
          },
          method: 'post'
        },
        function(data, status) {
          console.log('[AJAX SUCCESS]', status, JSON.stringify(data, null, 2));
          //remove synced action
          actions.shift();
          //save
          Settings.data('synchronize', actions);
          //sync next
          if (actions.length!==0) {
            send();
          }
        },
        function(error, status) {
          console.error('[AJAX ERROR]', status, JSON.stringify(error, null, 2));
        }
      );
    }
  };

};

var synchronize = new Synchronize();

/* Main Menu */

var mainMenu = new UI.Menu({
  sections: [{
    items: [
      {
        title: text.startGame,
        //subtitle: 'VS ' + team_visitor.name,
        icon: 'images/baby-foot-start-game.pbl.png'
      },
      {title: text.history},
      {title: text.options}
    ]
  }]
});

mainMenu.on('select', function(e) {
  console.log('#mainMenu.select', JSON.stringify(e.item, null, 2));
  if (e.item.title === text.startGame) {
    var gwPosScoreHome = new Vector2(4,15),
        gwPosScoreVisitor = new Vector2(4,99),
        gwPosTeamHome = new Vector2(4,55),
        gwPosTeamVisitor = new Vector2(4,79),
        gwPosRect = new Vector2(0,83),
        gwSizeRect = new Vector2(144,2);
    var gameWindow = new UI.Window({
      fullscreen: true,
      scrollable: false
    });
    var gwTextScoreHome = new UI.Text({
      position: gwPosScoreHome,
      size: new Vector2(136,42),
      font: 'bitham-42-bold',
      textAlign: 'center',
      text: '0'
    });
    var gwTextScoreVisitor = new UI.Text({
      position: gwPosScoreVisitor,
      size: new Vector2(136,42),
      font: 'bitham-42-bold',
      textAlign: 'center',
      text: '0'
    });
    var gwTextTeamHome = new UI.Text({
      position: gwPosTeamHome,
      size: new Vector2(136,24),
      textAlign: 'center',
      textOverflow: 'ellipsis',
      text: options.teamHome.name
    });
    var gwTextTeamVisitor = new UI.Text({
      position: gwPosTeamVisitor,
      size: new Vector2(136,24),
      textAlign: 'center',
      textOverflow: 'ellipsis',
      text: options.teamVisitor.name
    });
    var gwRect = new UI.Rect({
      position: gwPosRect,
      size: gwSizeRect,
      backgroundColor: 'white'
    });
    gameWindow.add(gwTextScoreHome);
    gameWindow.add(gwTextTeamHome);
    gameWindow.add(gwTextScoreVisitor);
    gameWindow.add(gwTextTeamVisitor);
    gameWindow.add(gwRect);

    var updateScore = function(textScore, team, gamelle) {
      var score = textScore.text();
      textScore.text( gamelle > -1 ? ++score : --score );
      if (
        ( options.endRule === text.onScore && score >= options.endScore ) ||
        ( options.endRule === text.twoPointsDifference && ( parseInt(gwTextScoreHome.text()) >= options.endScore || parseInt(gwTextScoreVisitor.text()) >= options.endScore ) && Math.abs( parseInt(gwTextScoreHome.text()) - parseInt(gwTextScoreVisitor.text()) ) >= 2 )
      ) {
        var endWindow = new UI.Window({
          fullscreen: true,
          scrollable: false
        });
        var ewImgCup = new UI.Image({
          position: new Vector2(4, 28),
          size: new Vector2(136, 112),
          image: 'images/cup.pbl.png'
        });
        var ewTextWinnerTeam = new UI.Text({
          position: new Vector2(25, 67),
          size: new Vector2(94,14),
          textAlign: 'center',
          textOverflow: 'ellipsis',
          text: team.name
        });
        var ewTextScores = new UI.Text({
          position: new Vector2(42, 31),
          size: new Vector2(60,40),
          textAlign: 'center',
          font: 'gothic-28-bold',
          //borderColor: 'white',
          text: gwTextScoreHome.text() + '-' + gwTextScoreVisitor.text()
        });
        endWindow.add(ewImgCup);
        endWindow.add(ewTextWinnerTeam);
        endWindow.add(ewTextScores);
        endWindow.on('show', function() {
          gameWindow.hide();
          Vibe.vibrate('double');
        });
        endWindow.show();
      }
      synchronize.goal(team, gamelle);
    };

    //Add point to team home
    gameWindow.on('click', 'up', function() {
      updateScore(gwTextScoreHome, options.teamHome, 0);
    });

    //Add point to team home
    gameWindow.on('click', 'down', function() {
      updateScore(gwTextScoreVisitor, options.teamVisitor, 0);
    });

    //Gamelle
    if (options.withGamelle) {
      gameWindow.on('click', 'select', function() {
        var gamelleMenu = new UI.Menu({
          sections: [{
            title: text.gamelle,
            items: [
              {title: options.teamHome.name},
              {title: options.teamVisitor.name}
            ]
          }]
        });
        gamelleMenu.on('select', function(e) {
          console.log('#gamelleMenu.select', JSON.stringify(e.item, null, 2));
          var teamSide = e.itemIndex === 0 ? text.home : text.visitor ;
          //No end on gamelle
          var textScore   = teamSide === text.home ? gwTextScoreHome : gwTextScoreVisitor ;
          var textScoreVs = teamSide === text.home ? gwTextScoreVisitor : gwTextScoreHome ;
          if (
            !options.endOnGamelle && ( options.endScore - parseInt(textScore.text()) ) <= 1 && ( 
              ( options.endRule === text.onScore ) ||
              ( options.endRule === text.twoPointsDifference && Math.abs( parseInt(gwTextScoreHome.text()) - parseInt(gwTextScoreVisitor.text()) ) !== 0 )
            )
          ) {
            var scoreToUpdate = teamSide === text.home ? gwTextScoreVisitor : gwTextScoreHome ;
            updateScore(scoreToUpdate, teamSide === text.home ? options.teamVisitor : options.teamHome, -1);
            gamelleMenu.hide();
          }
          else if (!options.negativeScore && parseInt(textScoreVs.text()) === 0) {
            updateScore(textScore, teamSide === text.home ? options.teamHome : options.teamVisitor, 1);
            gamelleMenu.hide();
          }
          else {
            var gamelleChooseMenu = new UI.Menu({
              sections: [{
                title: e.item.title,
                items: [
                  {
                    title: text.take,
                    icon: 'images/baby-foot-gamelle-plus.pbl.png'
                  },
                  {
                    title: text.remove,
                    icon: 'images/baby-foot-gamelle-minus.pbl.png'
                  }
                ]
              }]
            });
            gamelleChooseMenu.on('select', function(e) {
              console.log('#gamelleChooseMenu.select', JSON.stringify(e.item, null, 2));
              //update score
              var scoreToUpdate = (teamSide === text.home && e.item.title === text.take) || (teamSide === text.visitor && e.item.title === text.remove) ? gwTextScoreHome : gwTextScoreVisitor ;
              updateScore(scoreToUpdate, teamSide === text.home ? options.teamHome : options.teamVisitor, e.item.title === text.take ? 1 : -1);
              //hide menus
              gamelleChooseMenu.hide();
              gamelleMenu.hide();
            });
            gamelleChooseMenu.show();
          }
        });
        gamelleMenu.show();
      });
    }

    gameWindow.show();
    //synchronize
    synchronize.startGame();
  }
  else if(e.item.title === text.history) {}
  else if(e.item.title === text.options) {
    var optionMenu = new UI.Menu({
      sections: [
        {
          title: text.teams,
          items: [
            {
              title: text.home,
              subtitle: options.teamHome.name || ''
            },
            {
              title: text.visitor,
              subtitle: options.teamVisitor.name || ''
            }
          ]
        },
        {
          title: text.scoring,
          items: [
            {
              title: text.endScore,
              subtitle: options.endScore + text.pts
            },
            {
              title: text.endRule,
              subtitle: options.endRule === text.onScore ? text.onScore : text.twoPointsDifference
            },
            {
              title: text.withGamelle,
              subtitle: options.withGamelle ? text.yes : text.no
            },
            {
              title: text.endOnGamelle,
              subtitle: options.endOnGamelle ? text.yes : text.no
            },
            {
              title: text.negativeScore,
              subtitle: options.negativeScore ? text.yes : text.no
            }
          ]
        }]
    });

    var setTeamMenu = function(item) {
      /* Team Menu */
      var teamMenu = new UI.Menu({});
      //section
      var section = {
        title: item.item.title,
        items: []
      };
      teamMenu.section(0, section);
      //items
      var teams = Settings.option('teams');   
      for (var i in teams) {
        var team = teams[i];
        teamMenu.item(0, i, {title: team.name, subtitle: team.player_name_1 + ' & ' + team.player_name_2});
      }
      teamMenu.show();
      teamMenu.on('select', function(e) {
        console.log('#teamMenu.select', JSON.stringify(e.item));
        if (item.item.title === text.home) {
          options.teamHome = teams[e.itemIndex];
        }
        else {
          options.teamVisitor = teams[e.itemIndex];
        }
        Settings.data('options', options);
        optionMenu.item(item.sectionIndex, item.itemIndex, {title: item.item.title, subtitle: e.item.title});
        teamMenu.hide();
      });
    };

    optionMenu.on('select', function(e) {
      console.log('#optionMenu.select', JSON.stringify(e.item));
      if (e.item.title === text.home) {
        setTeamMenu(e);
      }
      else if (e.item.title === text.visitor) {
        setTeamMenu(e);
      }
      else if (e.item.title === text.endScore) {
        options.endScore = options.endScore === application.scores[0] ? application.scores[1] : application.scores[0] ;
        optionMenu.item(e.sectionIndex, e.itemIndex, {title: text.endScore, subtitle: options.endScore + text.pts});
        Settings.data('options', options);
      }
      else if (e.item.title === text.withGamelle) {
        options.withGamelle = !options.withGamelle;
        optionMenu.item(e.sectionIndex, e.itemIndex, {title: text.withGamelle, subtitle: options.withGamelle ? text.yes : text.no});
        Settings.data('options', options);
      }
      else if (e.item.title === text.endRule) {
        options.endRule = options.endRule === text.onScore ? text.twoPointsDifference : text.onScore ;
        optionMenu.item(e.sectionIndex, e.itemIndex, {title: text.endRule, subtitle: options.endRule});
        Settings.data('options', options);
      }
      else if (e.item.title === text.endOnGamelle) {
        options.endOnGamelle = !options.endOnGamelle;
        optionMenu.item(e.sectionIndex, e.itemIndex, {title: text.endOnGamelle, subtitle: options.endOnGamelle ? text.yes : text.no});
        Settings.data('options', options);
      }
      else if (e.item.title === text.negativeScore) {
        options.negativeScore = !options.negativeScore;
        optionMenu.item(e.sectionIndex, e.itemIndex, {title: text.negativeScore, subtitle: options.negativeScore ? text.yes : text.no});
        Settings.data('options', options);
      }
    });
    optionMenu.show();
  }
});

mainMenu.show();