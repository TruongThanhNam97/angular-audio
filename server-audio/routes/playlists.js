const express = require('express');
const router = express.Router();

const passport = require("passport"); // authorize user

const validatePlaylist = require('../validation/validate-playlist');

const playlistModel = require('../models/playlist');
const songModel = require('../models/song');


//@route    GET /playlists/
//@desc     GET playlist by UserId
//@access   Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    playlistModel.find({ userId: req.user._id, status: 0 })
        .populate({
            path: 'listSongs',
            populate: {
                path: 'comments.user',
                select: ['_id', 'username', 'avatar']
            },
            populate: {
                path: 'comments.subComments.user',
                select: ['_id', 'username', 'avatar']
            }
        })
        .then(playlist => {
            if (!playlist) {
                return res.status(404).json('Playlist not found');
            }
            res.status(200).json(playlist);
        }).catch(err => console.log(err));
});

//@route    POST /playlists/createPlayList
//@desc     Create playlist
//@access   Private
router.post('/createPlayList', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const { errors, isValid } = validatePlaylist(req.body);
    // Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }
    const { name } = req.body;
    const newPlayList = new playlistModel({
        name,
        userId: req.user._id
    });
    newPlayList.save().then(playList => res.status(200).json(playList));
});

//@route    POST /playlists/editPlayList
//@desc     Edit playlist
//@access   Private
router.post('/editPlayList', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const { errors, isValid } = validatePlaylist(req.body);
    // Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }
    const { name, playlistId } = req.body;
    playlistModel
        .findOneAndUpdate({ _id: playlistId }, { $set: { name } }, { new: true })
        .populate({
            path: 'listSongs',
            populate: {
                path: 'comments.user',
                select: ['_id', 'username', 'avatar']
            },
            populate: {
                path: 'comments.subComments.user',
                select: ['_id', 'username', 'avatar']
            }
        })
        .then(newPlayList => res.status(200).json(newPlayList))
        .catch(err => console.log(err));
});

//@route    POST /playlists/deletePlayList
//@desc     Delete playlist by UserId
//@access   Private
router.post('/deletePlayList', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const { playlistId } = req.body;
    playlistModel.findOneAndUpdate({ userId: req.user._id, _id: playlistId }, { $set: { status: 1 } }, { new: true })
        .then(playlist => res.status(200).json(playlist))
        .catch(err => console.log(err));
});


//@route    POST /playlists/addSong
//@desc     Add song to playlist by UserId
//@access   Private
router.post('/addSong', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const { playlistId, songId } = req.body;
    playlistModel.findById({ _id: playlistId }).then(playlist => {
        if (!playlist) {
            return res.status(404).json('Playlist not found');
        }
        const listSongs = [...playlist.listSongs];
        if (listSongs.filter(item => item.toString() === songId.toString()).length > 0) {
            return res.status(400).json(`This song has already existed in ${playlist.name}`);
        }
        playlist.listSongs = [...listSongs, songId];
        playlist.save().then(playlist => {
            playlistModel.findById({ _id: playlist._id })
                .populate({
                    path: 'listSongs',
                    populate: {
                        path: 'comments.user',
                        select: ['_id', 'username', 'avatar']
                    },
                    populate: {
                        path: 'comments.subComments.user',
                        select: ['_id', 'username', 'avatar']
                    }
                }).then(item => res.status(200).json(item));
            songModel.findById({ _id: songId }).then(song => {
                if (song) {
                    song.listPlayLists = [...song.listPlayLists, playlist._id.toString()];
                    song.save();
                }
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
});

//@route    POST /playlists/deleteSong
//@desc     Delete song in playlist
//@access   Private
router.post('/deleteSong', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const { playlistId, songId } = req.body;
    playlistModel.findById({ _id: playlistId }).then(playlist => {
        if (!playlist) {
            return res.status(404).json('Playlist not found');
        }
        const listSongs = [...playlist.listSongs];
        if (listSongs.filter(item => item.toString() === songId.toString()).length === 0) {
            return res.status(400).json('This song has not already existed in this playlist');
        }
        playlist.listSongs = playlist.listSongs.filter(item => item.toString() !== songId.toString());
        playlist.save().then(playlist => {
            playlistModel.findById({ _id: playlist._id })
                .populate({
                    path: 'listSongs',
                    populate: {
                        path: 'comments.user',
                        select: ['_id', 'username', 'avatar']
                    },
                    populate: {
                        path: 'comments.subComments.user',
                        select: ['_id', 'username', 'avatar']
                    }
                }).then(item => res.status(200).json(item));
            songModel.findById({ _id: songId }).then(song => {
                if (song) {
                    song.listPlayLists = song.listPlayLists.filter(item => item.toString() !== playlist._id.toString());
                    song.save();
                }
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
});


module.exports = router;