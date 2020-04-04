require('dotenv').config()
const qs = require('qs')
module.exports = (req, params, countData) => {
  const totalPages = Math.ceil(countData / parseInt(params.perPage))
  const query = req.query
  query.page = parseInt(params.currentPage) + 1
  const nextPage = (parseInt(params.currentPage) < totalPages ? process.env.APP_URL.concat(`${req.originalUrl.split('?')[0]}?${qs.stringify(query)}`) : null)
  query.page = parseInt(params.currentPage) - 1
  const previousPage = (parseInt(params.currentPage) > 1 ? process.env.APP_URL.concat(`${req.originalUrl.split('?')[0]}?${qs.stringify(query)}`) : null)

  return {
    currentPage: params.currentPage,
    nextPage,
    previousPage,
    totalPages,
    perPage: params.perPage,
    totalEntries: countData
  }
}