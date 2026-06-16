async function testApi() {
    try {
        const response = await fetch("http://localhost:5000/api/chatbot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Hello! Tell me about your kitchen designs." })
        });
        const data = await response.json();
        console.log("RESPONSE FROM BACKEND CHATBOT API:", data);
    } catch (err) {
        console.error("FAILED TO QUERY BACKEND CHATBOT API:", err);
    }
}

testApi();
