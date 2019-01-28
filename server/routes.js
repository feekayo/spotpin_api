var express = require('express'),
    router = express.Router(),
    //url = require('url'), //download url module
    accounts =require('../controllers/accounts'),//define controllers
    create = require('../controllers/create'),
    read = require('../controllers/read');
    update = require('../controllers/update'),
    remove = require('../controllers/delete');

module.exports = function(app){
    
    //accounts routes **tested and working
    router.get('/',accounts.index);//hello message
    router.get('/user/login',accounts.login);//login route 
    router.post('/user/register',accounts.signup); //register route
    router.put('/user/forgot_password',accounts.forgot_password); //forgot password route
    router.put('/user/update/account/:session_id',accounts.update_account); //update account route
    //router.post('/user/update/password/:uniq_key',accounts.update_password);//update password route
    router.get('/user/confirm/:uniq_key',accounts.confirm_account);//confrim account
    router.delete('/user/signout/:session_id',accounts.signout); //signout route
    
    //create routes
    router.post('/create/story/:session_id',create.story); //create story route
    router.post('/create/pin/:session_id',create.pin); //create pin route
    router.post('/create/capsule/:session_id',create.capsule); //create capsule route **works
    router.post('/create/capsule_invites/:session_id',create.capsule_members); //create capsule invites route
    router.post('/create/leaderboard/:session_id',create.leaderboard); //create leaderboard route **works
    router.post('/create/leaderboard_invites/:session_id',create.leaderboard_members); //create leaderboard invites route
    router.post('/create/favorite/:session_id',create.favorite);//create favorite route
    router.post('/create/dislike/:session_id',create.dislike);//create dislike route
    router.post('/create/pinpal/:session_id',create.pinpal);//create pinpal request route
    router.post('/create/watchlist_item/:session_id',create.watchlist_item);//create pinpal request route
    //router.put('/create/event/:session_id',create.event);//create event route
 
    //read routes
    router.get('/read/nearby_spots',read.nearby_spots); // fetch nearby spots route
    router.get('/read/spot_pins',read.spot_pins); //fetch spot pins route
    router.get('/read/user_stats',read.user_stats);//fetch user stats
    router.get('/read/user_pinpals/:session_id', read.user_pinpals); //fetch user pinpal route
    router.get('/read/discover_options', read.discover_options); //fetch discover options route
    router.get('/read/yesterday_pins', read.yesterday_pins); //fetch all of yesterday's pins route
    router.get('/read/notifications/:session_id', read.user_notifications); //fetch user notifications route
    router.get('/read/pinpal_requests/:session_id', read.pinpal_requests); //fetch user pinpal requests route
    router.get('/read/user_pins/:session_id', read.user_pins); //fetch user pins route
    router.get('/read/user_leaderboards/:session_id', read.user_leaderboards); //fetch user leaderboards route
    router.get('/read/leaderboard', read.leaderboard); //fetch leaderboard route
    router.get('/read/capsule', read.capsule); //fetch leaderboard route
    router.get('/read/user_favorites/:session_id', read.user_favorites); //fetch user route
    router.get('/read/somewhere', read.somewhere); //get all the spots in a place in a search query route
    router.get('/read/user_capsules', read.user_capsules); //get all the time capsules a person is participating in route
    router.get('/read/capsule_pins', read.capsule_pins); //get all the pins in a capsule route
    router.get('/read/capsule_participants', read.capsule_participants); //get capsule participants route
    //**NOT NEEDED router.get('/read/capsule_invites', read.capsule_invites); //get capsule invites **NOT NEEEDED
    router.get('/read/user_watchlist', read.user_watchlist); //get capsule invites
    //router.get('/read/user_events/:session_id',read.user_events);//get user events route
    //router.get('/read/nearby_events/:session_id',read.nearby_events);//get nearby events
    
    
    //update routes
    router.put('/update/capsule/:session_id',update.capsule); //route  to update time capsule details
    router.put('/update/pinpal/:session_id',update.pinpal); //route to update pinpal status
    router.put('/update/leaderboard/:session_id',update.leaderboard); //route to update leaderboard details
    //router.put('/update/leaderboard_admin/:session_id',update.leaderboard_admin); //route to update leaderboard admin details
    router.put('/update/leaderboard_invite/:session_id',update.leaderboard_invite); //route to update leaderboard invite status
    router.put('/update/capsule_invite/:session_id',update.capsule_invite); //route to update capsule invite status
    router.put('/update/lock_capsule/:session_id',update.lock_capsule); //route to update capsule invite status
    //router.put('/update/close_event/:session_id',update.close_event);//close event
    //router.put('/update/update_event/:session_id',update.update_event);//update event
    
    
    //delete routes
    router.delete('/delete/story/:session_id',remove.story)//route to delete story
    router.delete('/delete/pin/:session_id',remove.pin)//route to delete pin
    router.delete('/delete/favorite/:session_id',remove.favorite)//route to delete favorite
    router.delete('/delete/dislike/:session_id',remove.dislike)//route to delete dislike
    router.delete('/delete/leaderboard/:session_id',remove.leaderboard)//route to delete leaderboard
    router.delete('/delete/leaderboad_member/:session_id',remove.leaderboard_participant)//route to delete leaderboard participation
    router.delete('/delete/capsule/:session_id',remove.capsule)//route to delete capsule
    router.delete('/delete/capsule_member/:session_id',remove.capsule_participant)//route to delete capsule participants 
    router.delete('/delete/pinpal/:session_id',remove.pinpal)//route to delete pinpal
    router.delete('/delete/watchlist_item/:session_id',remove.watchlist_item)//route to delete pinpal
    //router.delete('/delete/event/:session_id',remove.event)//route to delete event
    
    app.use(router);
}
