const express = require('express')
const axios = require('axios')
const jsdom = require('jsdom')
const { JSDOM } = jsdom

const app = express()
const PORT = 3000

app.get('/', (req, res) => {
  // Serving the index.html file from the "public" folder
  res.sendFile(__dirname + '/public/index.html')
})

// Defining the /api/scrape endpoint
app.get('/api/scrape', async (req, res) => {
  const keyword = req.query.keyword

  if (!keyword) {
    return res.status(400).json({ error: 'Keyword is required' })
  }

  try {
    // Fetching the Amazon search results page for the given keyword
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`
    const response = await axios.get(url)

    // Parsing the HTML content using JSDOM
    const dom = new JSDOM(response.data)
    const document = dom.window.document

    // Extracting the product listings
    const products = []
    const items = document.querySelectorAll('.s-result-item')

    items.forEach((item) => {
      const titleElement = item.querySelector('.a-text-normal')
      const ratingElement = item.querySelector('.a-icon-alt')
      const reviewsElement = item.querySelector('.a-size-base')
      const imageElement = item.querySelector('.s-image')

      if (titleElement && ratingElement && reviewsElement && imageElement) {
        const product = {
          title: titleElement.textContent,
          rating: ratingElement.textContent,
          reviews: reviewsElement.textContent,
          imageUrl: imageElement.src,
        }

        products.push(product)
      }
    })

    // Returning the extracted data in JSON format
    res.json(products)
  } catch (error) {
    console.error('Error scraping Amazon:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Starting the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
