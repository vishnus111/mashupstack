var even = [1,2,3,4,5,6,7,8,9,10]
var newArr =[]



findEven = ()=>{
    for (let i=1;i<=even.length;i++){
        if(even[i]%2==0){
            newArr.push(even[i])
            
        }
        
    }
    console.log(newArr);

}

findEven()