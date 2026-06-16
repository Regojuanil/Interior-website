async function testContactForm() {
    try {
        const response = await fetch("http://localhost:5000/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Ravi Kumar",
                email: "ravi.kumar@example.com",
                phone: "9876543210",
                message: "I am interested in a full home interior design for my 3BHK apartment in Hyderabad."
            })
        });
        const data = await response.json();
        console.log("CONTACT FORM RESPONSE:", data);
    } catch (err) {
        console.error("FAILED:", err);
    }
}

testContactForm();
