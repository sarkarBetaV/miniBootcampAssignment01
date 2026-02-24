1) What is the difference between null and undefined?
    
    undefined এর ক্ষেত্রে এমন একটি ভেরিয়েবল ডিক্লেয়ার করা হয় যার কোনো মান দেওয়া হয়নি এবং null এর ক্ষেত্রে একটি ভেরিয়েবল ইচ্ছাকৃতভাবে খালি বা শূন্য সেট করা হয় । 

2) What is the use of the map() function in JavaScript? How is it different from forEach()?

    map() একটি অ্যারে মেথড যা প্রতিটি এলিমেন্টের উপর একটি ফাংশন প্রয়োগ করে এবং একটি নতুন অ্যারে রিটার্ন করে। মূল অ্যারেটি অপরিবর্তিত থাকে।

    forEach() ফাংশন:
    forEach() প্রতিটি এলিমেন্টের উপর একটি ফাংশন প্রয়োগ করে কিন্তু কিছুই রিটার্ন করে না (undefined রিটার্ন করে)। এটি শুধু লুপ চালানোর জন্য ব্যবহৃত হয়।

3) What is the difference between == and ===?

    == এবং === উভয়ই তুলনা করার অপারেটর, 
    == শুধু মান (value) চেক করে আর ===	মান (value) এবং টাইপ (type) দুই-ই চেক করে

4) What is the significance of async/await in fetching API data?

    async/await হলো JavaScript এ asynchronous operations হ্যান্ডেল করার একটি আধুনিক উপায়। এটি Promises এর উপর ভিত্তি করে তৈরি কিন্তু সিনট্যাক্স অনেক বেশি পরিষ্কার এবং পড়তে সহজ। কোড পড়তে সহজ (Readability),  async/await ব্যবহার করলে asynchronous কোড synchronous কোডের মতো দেখতে হয়, যা পড়তে এবং বুঝতে সহজ।

    এরর হ্যান্ডেলিং সহজ:
    try/catch ব্লক ব্যবহার করে সহজেই এরর হ্যান্ডেল করা যায়।

    ডিবাগ করা সহজ:
    synchronous কোডের মতোই ডিবাগ করা যায়।


5) Explain the concept of Scope in JavaScript (Global, Function, Block).

    Scope বা পরিধি হলো কোডের সেই এলাকা যেখানে একটি ভেরিয়েবল অ্যাক্সেস করা যায়। JavaScript এ তিন ধরনের scope আছে:

    1. গ্লোবাল স্কোপ (Global Scope):
    যে কোনো ভেরিয়েবল যা কোনো ফাংশন বা ব্লকের বাইরে ডিক্লেয়ার করা হয়, সে গ্লোবাল স্কোপে থাকে। এটা প্রোগ্রামের যে কোনো জায়গা থেকে অ্যাক্সেস করা যায়।

    javascript
    // গ্লোবাল স্কোপ
    var globalVariable = "আমি গ্লোবাল";

    function testFunction() {
    console.log(globalVariable); // অ্যাক্সেস করা যায়
    }

    if (true) {
  console.log(globalVariable); // অ্যাক্সেস করা যায়
    }
    
    2. ফাংশন স্কোপ (Function Scope):
    ফাংশনের ভিতরে ডিক্লেয়ার করা ভেরিয়েবল শুধু সেই ফাংশনের ভিতরেই অ্যাক্সেস করা যায়।

    javascript
    function myFunction() {
    // ফাংশন স্কোপ
    var functionVariable = "আমি ফাংশনের ভিতরে";
    console.log(functionVariable); // অ্যাক্সেস করা যায়
    }

    console.log(functionVariable); // Error! অ্যাক্সেস করা যায় না

    3. ব্লক স্কোপ (Block Scope):
    ব্লকের ভেতরে ডিক্লেয়ার করা ভেরিয়েবল শুধু সেই ব্লকের ভিতরেই অ্যাক্সেস করা যায়।

    javascript
    if (true) {
    // ব্লক স্কোপ
    let blockVariable = "আমি ব্লকের ভিতরে";
    const anotherVariable = "আমিও ব্লকের ভিতরে";
    var notBlockScoped = "আমি ব্লক স্কোপ ফলো করি না";
  
    console.log(blockVariable); // অ্যাক্সেস করা যায়
    console.log(anotherVariable); // অ্যাক্সেস করা যায়
    }

    console.log(blockVariable); // Error! অ্যাক্সেস করা যায় না
    console.log(anotherVariable); // Error! অ্যাক্সেস করা যায় না
    console.log(notBlockScoped); // অ্যাক্সেস করা যায় (কারণ var ব্লক স্কোপ ফলো করে না)
    Scope চেইন (Scope Chain):
    JavaScript এ inner scope outer scope এর ভেরিয়েবল অ্যাক্সেস করতে পারে, কিন্তু উল্টোটা সম্ভব না।

    javascript
    var global = "গ্লোবাল";

    function outer() {
    var outerVar = "আউটার";
    
    function inner() {
        var innerVar = "ইনার";
        console.log(global);   // অ্যাক্সেস করা যায়
        console.log(outerVar); // অ্যাক্সেস করা যায়
        console.log(innerVar); // অ্যাক্সেস করা যায়
    }
    
    inner();
    console.log(innerVar); // Error! অ্যাক্সেস করা যায় না
    }
