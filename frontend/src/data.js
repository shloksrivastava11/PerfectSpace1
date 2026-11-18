const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`
const IM = ['photo-1522708323590-d24dbb6b0267','photo-1560448204-e02f11c3d0e2','photo-1502672260266-1c1ef2d93688','photo-1493809842364-78817add7ffb','photo-1555854877-bab0e564b8d5','photo-1540518614846-7eded433c457'].map(img)
const mk = (i, title, type, city, area, rent, room, rating, reviews, rooms, fac) => ({
  id: String(i), title, type, city, area, rent, deposit: rent * 2, room, rating, reviews, rooms, facilities: fac,
  images: [IM[i % 6], IM[(i + 1) % 6], IM[(i + 2) % 6]],
  food: fac.includes('Food') ? 'Breakfast and dinner included, veg and non-veg on request.' : 'No meals; shared kitchen available.',
  rules: ['No smoking inside rooms', 'Visitors allowed until 8 PM', 'Gate closes at 11 PM', 'One month notice before leaving'],
  description: 'A well-kept, secure property with daily housekeeping, a quiet study-friendly environment and a short commute to colleges and offices nearby.',
  owner: { name: 'Rakesh Sharma', phone: '+91 98XXXXXX10' },
})
export const properties = [
  mk(0,'Sunrise Boys PG','Boys PG','Noida','Sector 62',7500,'Double Sharing',4.6,128,5,['Wi-Fi','Food','Laundry','Power Backup']),
  mk(1,'Orchid Girls Residency','Girls PG','Noida','Sector 15',9000,'Single Sharing',4.8,96,2,['AC','Wi-Fi','Food','Parking','Laundry']),
  mk(2,'Urban Nest Co-Living','Co-Living','Gurugram','Sector 44',13500,'Single Sharing',4.5,210,4,['AC','Wi-Fi','Laundry','Parking','Power Backup']),
  mk(3,'Scholars Hostel','Hostel','Greater Noida','Knowledge Park III',5200,'Triple Sharing',4.2,74,9,['Wi-Fi','Food','Power Backup']),
  mk(4,'Lotus Girls PG','Girls PG','Delhi','Laxmi Nagar',8200,'Double Sharing',4.4,88,3,['Wi-Fi','Food','Laundry']),
  mk(5,'Metro View PG','Boys PG','Ghaziabad','Indirapuram',6400,'Double Sharing',4.3,61,6,['Wi-Fi','Food','Parking']),
  mk(6,'Indiranagar Stay Co-Living','Co-Living','Bangalore','Indiranagar',16000,'Single Sharing',4.7,152,3,['AC','Wi-Fi','Laundry','Power Backup','Parking']),
  mk(7,'Campus Edge Hostel','Hostel','Delhi','Mukherjee Nagar',4800,'Triple Sharing',4.1,47,12,['Wi-Fi','Power Backup']),
]
export const cities = [
  { name:'Noida', n:320, img: img('photo-1486406146926-c627a92ad1ab') },
  { name:'Delhi', n:410, img: img('photo-1587474260584-136574528ed5') },
  { name:'Ghaziabad', n:150, img: img('photo-1449824913935-59a10b8d2000') },
  { name:'Greater Noida', n:120, img: img('photo-1477959858617-67f85cf4f1df') },
  { name:'Gurugram', n:260, img: img('photo-1460317442991-0ec209397118') },
  { name:'Bangalore', n:300, img: img('photo-1596176530529-78163a4f7af2') },
]
export const testimonials = [
  { name:'Ananya Gupta', role:'B.Tech student, Noida', text:'I found a girls PG ten minutes from my college and booked it the same day. The photos matched the room exactly.' },
  { name:'Rohit Verma', role:'Software engineer, Gurugram', text:'Comparing rent, food and rules side by side saved me a week of calling brokers.' },
  { name:'Sneha Iyer', role:'MBA student, Bangalore', text:'The owner replied within an hour and scheduling a visit was easy.' },
]
export const typeOptions = ['Boys PG','Girls PG','Co-Living','Hostel']
export const roomOptions = ['Single Sharing','Double Sharing','Triple Sharing']
export const facilityOptions = ['AC','Wi-Fi','Food','Laundry','Parking','Power Backup']
export const inr = (n) => '₹' + n.toLocaleString('en-IN')
