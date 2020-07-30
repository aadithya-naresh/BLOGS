const puppeteer = require('puppeteer')
const News = require('../models/news')

const callFunction = async (present) =>{
    
   if(present)  News.collection.drop()
   const browser = await puppeteer.launch({args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
  ]
})

    const page = await browser.newPage()

    await page.goto('https://www.enn.com/climate')

   const result = await page.evaluate(() =>{
       let details = document.querySelectorAll('#adminForm ul li')
       const List = [...details]
       return List.map(h => h.innerHTML)
   })

   const text = await page.evaluate(() =>{
    let details = document.querySelectorAll('#adminForm ul li')
    const List = [...details]
    return List.map(h => h.innerText)
   })

   let url = [],articleUrl = [],bodyText = []
   result.forEach((result) =>{
    url.push(result.match('(?<=img src=\").+?(?=")'))
    articleUrl.push("https://www.enn.com"+result.match('(?<=a href=\").+?(?=")').toString())
   })

   for(let x=0;x<articleUrl.length;x++){
    const page = await browser.newPage();
    await page.goto(articleUrl[x]);


    const result = await page.evaluate(() =>{
        let ab =document.querySelectorAll('#t3-content div.item-row.row-main div article section.article-full.has-article-tools div.article-content-main section p')
        const List = [...ab]
        return List.map(h => h.innerHTML)
    })

    let answer = ''
    for(let j=0;j<result.length;j++){
    if(result[j].toString().match(/.+?(<a)/))
        break;

    answer += result[j]   
    }
    bodyText.push(answer)
    await page.close()
   }

   
   let i=0
   text.forEach(async (text)=>{
        const details=text.split('\n')

        try{
        
        let news
        if(url[i]){
         news = new News({
            title:details[0],
            body:bodyText[i],
            imageUrl:'https:'+url[i].toString()
        })
    }
        else{        
         news = new News({
            title:details[0],
            body:bodyText[i],
            imageUrl:'https://iitpkd.ac.in/sites/default/files/default_images/default-news-image_0.png'
        })
    }
    i++
       console.log(news)
        //news.markModified('News')
        await news.save()
        }catch(error){
            console.log(error)
        }
  })
  
    await browser.close()
        
}

module.exports = callFunction