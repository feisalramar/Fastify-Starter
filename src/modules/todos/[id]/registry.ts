import type { FastifyInstance } from 'fastify';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

import type { TodoItem } from '../types';
import { body, params, message, entity } from '../schema';

export default async (app: FastifyInstance) => {
  const router = app.withTypeProvider<TypeBoxTypeProvider>();
  const todos = app.mongo.db?.collection('todos');

  /*
  curl --request POST \
    --url http://127.0.0.1:3000/api/todos/new \
    --header 'content-type: application/json' \
    --data '{
      "title": "foo"
    }'
  */
  router.post(
    '/',
    {
      schema: {
        params: Type.Object({ id: Type.Literal('new') }),
        body,
        response: { 200: Type.Object({ message }) },
      },
    },
    async (req, reply) => {
      await todos?.insertOne({
        title: req.body.title,
        completed: req.body.completed,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return reply.send({ message: 'OK' });
    },
  );

  /*
  curl --request GET \
    --url http://127.0.0.1:3000/api/todos/634787af6d44cfba9c0df8ea
  */
  router.get(
    '/',
    {
      schema: {
        params,
        response: { 200: Type.Object({ message, result: Type.Partial(entity) }) },
      },
    },
    async (req, reply) => {
      const result = await todos?.findOne<TodoItem>({
        _id: { $eq: new app.mongo.ObjectId(req.params.id) },
      });

      return reply.send({ message: 'OK', result: result || {} });
    },
  );

  /*
  curl --request PUT \
    --url http://127.0.0.1:3000/api/todos/634516681a8fd0d3cd9791f1 \
    --header 'content-type: application/json' \
    --data '{
      "title": "foo",
      "completed": true
    }'
  */
  router.put(
    '/',
    {
      schema: {
        params,
        body,
        response: { 200: Type.Object({ message }) },
      },
    },
    async (req, reply) => {
      await todos?.updateOne(
        { _id: { $eq: new app.mongo.ObjectId(req.params.id) } },
        {
          $set: {
            title: req.body.title,
            completed: req.body.completed,
            updatedAt: new Date().toISOString(),
          },
        },
      );

      return reply.send({ message: 'OK' });
    },
  );

  /*
  curl --request DELETE \
    --url http://127.0.0.1:3000/api/todos/634516681a8fd0d3cd9791f1
  */
  router.delete(
    '/',
    {
      schema: {
        params,
        response: { 200: Type.Object({ message }) },
      },
    },
    async (req, reply) => {
      await todos?.deleteOne({ _id: { $eq: new app.mongo.ObjectId(req.params.id) } });
      return reply.send({ message: 'OK' });
    },
  );
};