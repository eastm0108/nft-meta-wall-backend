const successHandle = (res, data, message) => {
     res.send({
          status: 'success',
          data,
          message
     });

     res.end();
};

module.exports = {
     successHandle,
};