
import Currency from "../models/currency.js"


export const seedCurrencyIfNeeded = async() =>{
try{
    const count = await Currency.countDocuments({})
    if(count > 0){
        console.log(`${count} currencies already exists-> skipping seeding`)
        return
    } 

    const response = await fetch(`https://restcountries.com/v3.1/all?fields=currencies`)
    const countries = await response.json()
        console.log(countries[0])
        let currencyMap= new Map()
    for(const country of countries){
        if(!country) continue
        for(const [code, info] of Object.entries(country?.currencies)){
if (!info) continue;
            if(!currencyMap.has(code)){ 
            currencyMap.set(code,{
                code,
                name: info.name || "unknown",
                symbol: info.symbol || ""
            })
        }
        }    
    }
 const uniqueCurrencies  = [...currencyMap.values()]
 await Currency.insertMany(uniqueCurrencies)
console.log(`${uniqueCurrencies.length} currrency seeding complete`)


} catch(error){
    console.log(error.message)
}
}