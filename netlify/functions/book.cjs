exports.handler = async function (event) {
  try {
    console.log('book', event)

    return {
      statusCode: 200,
      body: {},
    }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed booking.',
      }),
    }
  }
}
