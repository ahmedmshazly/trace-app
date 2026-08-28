'use strict';

const { createApp } = require('../backend/dist/app');
const { connectDb } = require('../backend/dist/lib/db');

/** Cached boot promise, reused across warm serverless invocations. */
let bootPromise = null;

function getApp() {
  if (!bootPromise) {
    bootPromise = connectDb().then(() => createApp());
  }
  return bootPromise;
}

/**
 * Vercel serverless entry for the Trace Express API.
 * All `/api/*` traffic is rewritten here; Express routes stay unchanged.
 */
module.exports = async (req, res) => {
  const app = await getApp();
  return app(req, res);
};
