const mongoose = require('mongoose');
const { appError } = require('../exceptions/index');
const User = require('../models/user');
const { HTTP_STATUS, ERROR_MESSAGE } = require('../constants/index');

const isAuth = async (req, res, next) => {
  next();
};

const verificationAuth = async (req, res, next) => {
  next();
};

module.exports = {
  isAuth,
  verificationAuth,
}