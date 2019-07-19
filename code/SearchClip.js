var config = require('config')
var http = require('http')
var dates = require('dates')
var console = require('console')

const SATURDAY = 6
const URL = config.get('url')
const MEDIA_URL = config.get('media.url')

module.exports.function = function searchClip (date) {
  console.debug('input:', date)
  if (date) date = dates.ZonedDateTime.fromDate(date)
  else date = dates.ZonedDateTime.now()
  
  const diff = SATURDAY - date.getDayOfWeek()
  if (diff != 0) date = date.plusDays(diff)  
  console.debug('date:', date)
  
  const params = {
    limit: 24,
    sort: 'new',
    cliptype: '01'
  }
  
  const options = {
    format: 'json'
  }
  
  const url = URL + '?' + Object.keys(params).map(key => key + '=' + params[key]).join('&')  
  const res = http.getUrl(url, options)

  const compareDate = (d1, d2) => 
    d1.getYear() == d2.getYear() 
    && d1.getMonth() == d2.getMonth() 
    && d1.getDay() == d2.getDay()
  
  const clip = res.find(item => {
    const broaddate = dates.ZonedDateTime.parseDateTime(item.broaddate)
    return compareDate(date, broaddate)
  })
  
  if (!clip) return null 
  
  console.debug(clip)
  const broaddate = dates.ZonedDateTime.parseDateTime(clip.broaddate)
  
  return {
    title: clip.content.contenttitle,
    date: dates.ZonedDateTime.parseDateTime(clip.broaddate).getDateTime(),
    thumbnail: clip.thumb.large,
    link: MEDIA_URL + '/' + clip.mediaid
  }
}
