import express from 'express';
import mongoDB from 'mongodb';
import { CompressionTypes } from 'kafkajs';
import mongojs from 'mongojs';
import { actor } from './store';

const db = mongojs(process.env.MONGO_URL || 'mongodb://mongodb:27017/kafka');

const routes = express.Router();

routes.get('/actors', (req, res) => {
  db.collection('actors').find({}, (err, data) => {
    console.log('Getting all actors: ' + JSON.stringify({ ...data }));
    return res.json({ allActors: data });
  });
});

routes.post('/actors/new', async (req, res) => {
  try {
    await req.producer.send({
      topic: 'topic-actors',
      compression: CompressionTypes.GZIP,
      messages: [{ value: JSON.stringify({ ...actor }) }],
    });

    return res.json({ actor });
  } catch (error) {
    console.error('Pushing new actor failed: ' + error);
  }
});

routes.get('/actors/:id', (req, res) => {
  db.collection('actors').find({ _id: mongoDB.ObjectId(req.params.id) }, (err, data) => {
    console.log('Actor by id: ' + JSON.stringify({ ...data }));
    return res.json({ actor: data });
  });
});

routes.delete('/actors/:id', (req, res) => {
  db.collection('actors').remove({ _id: mongoDB.ObjectId(req.params.id) }, (err, data) => {
    console.log('Delete actor by id: ' + JSON.stringify({ ...data }));
    return res.json({ actor: data });
  });
});

routes.get('/films', (req, res) => {
  db.collection('actors').aggregate(
    [
      { $sort: { surname: 1, name: 1 } },
      {
        $project: {
          _id: '$_id',
          actor: { $concat: ['$name', ' ', '$surname'] },
          movies: '$movies.title',
        },
      },
    ],
    (err, data) => res.json({ actor: data })
  );
});

routes.get('/genres', (req, res) => {
  const findActor = {
    name: 'Эмма',
    surname: 'Стоун',
  };

  db.collection('actors').aggregate(
    [
      { $match: { name: findActor.name, surname: findActor.surname } },
      { $unwind: '$movies' },
      {
        $project: {
          _id: 0,
          genres: '$movies.genre',
        },
      },
      { $unwind: '$genres' },
      {
        $group: {
          _id: '$genres',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, _id: 1 } },
    ],
    (err, data) => res.json({ actor: data })
  );
});

routes.get('/director-movies', (req, res) => {
  const director = 'Алехандро Гонсалес Иньярриту';

  db.collection('actors').aggregate(
    [
      { $unwind: '$movies' },
      { $match: { 'movies.director': director } },
      {
        $group: {
          _id: '_$id',
          movies: { $addToSet: '$movies' },
        },
      },
      { $unwind: '$movies' },
      {
        $project: {
          _id: 0,
          title: '$movies.title',
          year: '$movies.year',
        },
      },
      { $sort: { year: -1, title: 1 } },
    ],
    (err, data) => res.json({ actor: data })
  );
});

routes.get('/movie-actors', (req, res) => {
  const movie = 'Бёрдмэн';

  db.collection('actors').aggregate(
    [
      { $unwind: '$movies' },
      { $match: { 'movies.title': movie } },
      {
        $project: {
          _id: 0,
          actor: { $concat: ['$name', ' ', '$surname'] },
          age: '$age',
        },
      },
      { $sort: { age: -1 } },
    ],
    (err, data) => res.json({ actor: data })
  );
});

export default routes;
