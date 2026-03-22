async function testOrders() {
    try {
        const res = await fetch('http://localhost:5000/api/orders');
        console.log('GET /api/orders status:', res.status);
        const text = await res.text();
        console.log('Body:', text);

        const res2 = await fetch('http://localhost:5000/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
        console.log('POST /api/orders status:', res2.status);
        const text2 = await res2.text();
        console.log('Body POST:', text2);

        const res3 = await fetch('http://localhost:5000/api/orders/total-sales-by-date');
        console.log('GET /total-sales-by-date status:', res3.status);
        const text3 = await res3.text();
        console.log('Body:', text3);

    } catch (err) {
        console.error(err);
    }
}
testOrders();
