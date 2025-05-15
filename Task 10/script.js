function f1(){
    const productId = 1;
    const url = `https://dummyjson.com/products/${productId}`;
  
    fetch(url)
      .then((res =>{
        return res.json()
      })
      ).then((data)=>{
        console.log(data);
      })
  }