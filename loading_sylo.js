var bar1 = new ldBar("#sylo")
setTimeout(()=>{
    getDataFromVariable("61526f7edb1d5a0049862ae1",window.TOKEN,r=>{        
        bar1.set(r[0].value)
    })
},1000)

function getDataFromVariable(variable, token, callback) {
  var url = 'https://industrial.api.ubidots.com/api/v1.6/variables/' + variable + '/values?page_size=1';
  var headers = {
    'X-Auth-Token': token,
    'Content-Type': 'application/json'
  };
  
  $.ajax({
    url: url,
    method: 'GET',
    headers: headers,
    success: function (res) {
      callback(res.results);
    }
  });
}