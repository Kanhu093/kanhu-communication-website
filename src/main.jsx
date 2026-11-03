import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  onAuthStateChanged, signInWithPopup, signOut, updateProfile
} from "firebase/auth";
import {
  addDoc, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query,
  serverTimestamp, setDoc, updateDoc, where
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  ArrowRight, BadgeCheck, BookOpen, CalendarDays, CheckCircle2, ChevronDown,
  Clock3, FileCheck2, FileImage, FileText, Globe2, GraduationCap, Headphones,
  Home, IndianRupee, Languages, MapPin, Menu, MessageCircle, Phone, Printer,
  QrCode, ScanLine, Search, ShieldCheck, Smartphone, Upload, User, X
} from "lucide-react";
import { auth, db, storage, firebaseReady, googleProvider, RecaptchaVerifier, signInWithPhoneNumber } from "./firebase";
import "./style.css";

const PHONE = "6371728063", ALT_PHONE = "7077899154", EMAIL = "kanhucharanbhoi211@gmail.com";
const UPI = "6371728063@ybl";
const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || "").toLowerCase();
const serviceData = [
  ["copy-bw","Photocopy One Side (Black & White)","ଫଟୋକପି ଗୋଟିଏ ପାଖ (କଳା ଧଳା)","₹2.50","₹2.50 / page","Copy", "Printing & Documents"],
  ["copy-colour","Photocopy One Side (Colour)","ଫଟୋକପି ଗୋଟିଏ ପାଖ (ରଙ୍ଗୀନ)","₹3.33","₹3.33 / page","Copy", "Printing & Documents"],
  ["copy-double-bw","Photocopy Two Side (Black & White)","ଫଟୋକପି ଦୁଇ ପାଖ (କଳା ଧଳା)","₹3.33","₹3.33 / sheet","Copy", "Printing & Documents"],
  ["copy-double-colour","Photocopy Two Side (Colour)","ଫଟୋକପି ଦୁଇ ପାଖ (ରଙ୍ଗୀନ)","₹5","₹5 / sheet","Copy", "Printing & Documents"],
  ["printout","Printout One Side (Black / Colour)","ପ୍ରିଣ୍ଟଆଉଟ୍ ଗୋଟିଏ ପାଖ (କଳା ଧଳା / ରଙ୍ଗୀନ)","₹5","₹5 / page","Print", "Printing & Documents"],
  ["scan","Document Scanning","ଡକ୍ୟୁମେଣ୍ଟ ସ୍କାନିଂ","Contact","Contact for price","Scan", "Printing & Documents"],
  ["lamination","Lamination","ଲାମିନେସନ୍","Contact","Contact for price","Lamination", "Printing & Documents"],
  ["photo","Passport Size Photo (8 Pieces)","ପାସପୋର୍ଟ ସାଇଜ୍ ଫଟୋ (୮ଟି)","₹50","₹50 / 8 pieces","Photo", "Printing & Documents"],
  ["caste","Caste Certificate Application","ଜାତି ପ୍ରମାଣପତ୍ର ଆବେଦନ","₹200","₹200","Certificate", "Government Services"],
  ["income","Income Certificate Application","ଆୟ ପ୍ରମାଣପତ୍ର ଆବେଦନ","₹150","₹150","Certificate", "Government Services"],
  ["resident","Resident Certificate Application","ବାସିନ୍ଦା ପ୍ରମାଣପତ୍ର ଆବେଦନ","₹150","₹150","Certificate", "Government Services"],
  ["legal-heir","Legal Heir Certificate Application","ଉତ୍ତରାଧିକାରୀ ପ୍ରମାଣପତ୍ର ଆବେଦନ","₹400","₹400","Certificate", "Government Services"],
  ["birth","Birth Certificate Application","ଜନ୍ମ ପ୍ରମାଣପତ୍ର ଆବେଦନ","₹400","₹400","Certificate", "Government Services"],
  ["death","Death Certificate Application","ମୃତ୍ୟୁ ପ୍ରମାଣପତ୍ର ଆବେଦନ","₹400","₹400","Certificate", "Government Services"],
  ["scholarship","Scholarship Application","ଛାତ୍ରବୃତ୍ତି ଆବେଦନ","₹100","₹100","Scholarship", "Education"],
  ["dtp","DTP & Document Formatting","ଡିଟିପି ଓ ଡକ୍ୟୁମେଣ୍ଟ ଫର୍ମାଟିଂ","Contact","Contact for price","DTP", "Education"],
  ["project","Project Presentation","ପ୍ରୋଜେକ୍ଟ ପ୍ରେଜେଣ୍ଟେସନ୍","Contact","Contact for price","Project", "Education"],
  ["recharge","Mobile Recharge","ମୋବାଇଲ୍ ରିଚାର୍ଜ","Contact","Contact for price","Recharge", "Other Services"]
];
const fixedPrices = Object.fromEntries(serviceData.filter(x => /^\₹/.test(x[3])).map(x => [x[0], Number(x[3].replace(/[₹,]/g,""))]));
const copy = {
  en: {
    nav:["Home","Services","Price List","Book a Service","Track Booking","About","Contact"],
    eyebrow:"YOUR LOCAL DIGITAL SERVICE CENTRE",
    title:"Your work, made", highlight:"simple.",
    desc:"Printing, photocopying, online applications and everyday digital services, all in one trusted place.",
    book:"Book a Service", explore:"Explore Services", why:"Everything you need, under one roof",
    whyDesc:"Convenient digital and documentation services for Baghabaspur and nearby areas.",
    services:"Our Services", servicesDesc:"Choose a service and send your booking request online.",
    prices:"Clear, affordable pricing", priceDesc:"The listed amount is the shop's service charge. Any official government fee, if applicable, will be shown separately before processing.",
    bookTitle:"Book your service", bookDesc:"Submit your request at least one day before your preferred service date. Full advance payment is required.",
    track:"Track your booking", trackDesc:"Sign in to view your booking progress, or look it up using your booking ID and phone number.",
    about:"About Kanhu Communication", aboutText:"Kanhu Communication is a local digital service centre committed to convenient, affordable and reliable printing, documentation and online application assistance for the people of Baghabaspur and nearby areas.",
    contact:"Let's get your work done", contactDesc:"Visit us or contact the shop for help with your digital service needs.",
    login:"Sign in / Create account", dashboard:"My Dashboard", admin:"Admin Dashboard", logout:"Sign out",
    name:"Full name", mobile:"Mobile number", email:"Email address (optional)", service:"Select service", quantity:"Quantity / pages", date:"Preferred service date", time:"Preferred collection time", notes:"Additional instructions", upload:"Upload document (optional)", submit:"Submit booking request",
    paymentTitle:"Pay by PhonePe", paymentDesc:"Pay the full amount in advance. Your booking is confirmed only after the shop verifies your payment.", copyUpi:"Copy UPI ID", txn:"UPI transaction ID", screenshot:"Payment screenshot", sendPayment:"Submit payment details",
    pending:"Pending payment", submitted:"Payment submitted", verified:"Payment verified", confirmed:"Confirmed", processing:"Processing", ready:"Ready for collection", completed:"Completed", cancelled:"Cancelled",
    oneDay:"Please book at least one day in advance. Full advance payment is required to confirm a booking.",
    government:"Government applications are subject to approval by the relevant authority. Listed prices are service charges; official fees, if any, are additional.",
    signGoogle:"Continue with Google", sendOtp:"Send OTP", verifyOtp:"Verify OTP", otp:"Enter OTP", phoneHint:"Use +91 followed by your 10-digit mobile number.",
    trackId:"Booking ID", trackPhone:"Phone number used for booking", find:"Find booking", noBooking:"No matching booking found.",
    features:["Affordable pricing","Easy online booking","Local customer support","One place for many services"],
    footer:"Your trusted partner for digital & documentation services."
  },
  od: {
    nav:["ମୂଳପୃଷ୍ଠା","ସେବାସମୂହ","ମୂଲ୍ୟ ତାଲିକା","ସେବା ବୁକ୍ କରନ୍ତୁ","ବୁକିଂ ଟ୍ରାକ୍","ଆମ ବିଷୟରେ","ଯୋଗାଯୋଗ"],
    eyebrow:"ଆପଣଙ୍କର ସ୍ଥାନୀୟ ଡିଜିଟାଲ୍ ସେବା କେନ୍ଦ୍ର",
    title:"ଆପଣଙ୍କ କାମକୁ କରନ୍ତୁ", highlight:"ସହଜ।",
    desc:"ପ୍ରିଣ୍ଟିଂ, ଫଟୋକପି, ଅନଲାଇନ୍ ଆବେଦନ ଓ ଦୈନନ୍ଦିନ ଡିଜିଟାଲ୍ ସେବା, ସବୁ ଗୋଟିଏ ବିଶ୍ୱସ୍ତ ସ୍ଥାନରେ।",
    book:"ସେବା ବୁକ୍ କରନ୍ତୁ", explore:"ସେବା ଦେଖନ୍ତୁ", why:"ଆପଣଙ୍କ ଆବଶ୍ୟକ ସମସ୍ତ ସେବା ଗୋଟିଏ ସ୍ଥାନରେ",
    whyDesc:"ବାଘବାସପୁର ଓ ନିକଟବର୍ତ୍ତୀ ଅଞ୍ଚଳ ପାଇଁ ସହଜ ଡିଜିଟାଲ୍ ଓ ଡକ୍ୟୁମେଣ୍ଟ ସେବା।",
    services:"ଆମର ସେବା", servicesDesc:"ସେବା ବାଛନ୍ତୁ ଏବଂ ଅନଲାଇନରେ ବୁକିଂ ଅନୁରୋଧ ପଠାନ୍ତୁ।",
    prices:"ସ୍ପଷ୍ଟ ଓ ସୁଲଭ ମୂଲ୍ୟ", priceDesc:"ଦିଆଯାଇଥିବା ମୂଲ୍ୟ ଦୋକାନର ସେବା ଶୁଳ୍କ। ସରକାରୀ ଶୁଳ୍କ ଥିଲେ ପ୍ରକ୍ରିୟା ପୂର୍ବରୁ ଅଲଗା ଭାବେ ଜଣାଯିବ।",
    bookTitle:"ଆପଣଙ୍କ ସେବା ବୁକ୍ କରନ୍ତୁ", bookDesc:"ପସନ୍ଦର ତାରିଖର ଅତି କମରେ ଗୋଟିଏ ଦିନ ପୂର୍ବରୁ ଅନୁରୋଧ ପଠାନ୍ତୁ। ସମ୍ପୂର୍ଣ୍ଣ ଅଗ୍ରିମ ଦେୟ ଆବଶ୍ୟକ।",
    track:"ଆପଣଙ୍କ ବୁକିଂ ଟ୍ରାକ୍ କରନ୍ତୁ", trackDesc:"ପ୍ରଗତି ଦେଖିବା ପାଇଁ ସାଇନ୍ ଇନ୍ କରନ୍ତୁ କିମ୍ବା ବୁକିଂ ID ଦ୍ୱାରା ଖୋଜନ୍ତୁ।",
    about:"କାହ୍ନୁ କମ୍ୟୁନିକେସନ୍ ବିଷୟରେ", aboutText:"କାହ୍ନୁ କମ୍ୟୁନିକେସନ୍ ବାଘବାସପୁର ଓ ନିକଟବର୍ତ୍ତୀ ଅଞ୍ଚଳର ଲୋକଙ୍କ ପାଇଁ ପ୍ରିଣ୍ଟିଂ, ଡକ୍ୟୁମେଣ୍ଟ ଓ ଅନଲାଇନ୍ ଆବେଦନ ସହାୟତା ପ୍ରଦାନ କରୁଥିବା ଏକ ସ୍ଥାନୀୟ ଡିଜିଟାଲ୍ ସେବା କେନ୍ଦ୍ର।",
    contact:"ଆପଣଙ୍କ କାମ ସମ୍ପୂର୍ଣ୍ଣ କରିବା", contactDesc:"ଡିଜିଟାଲ୍ ସେବା ପାଇଁ ଆମ ଦୋକାନକୁ ଆସନ୍ତୁ କିମ୍ବା ଯୋଗାଯୋଗ କରନ୍ତୁ।",
    login:"ସାଇନ୍ ଇନ୍ / ଆକାଉଣ୍ଟ ଖୋଲନ୍ତୁ", dashboard:"ମୋ ଡ୍ୟାସବୋର୍ଡ", admin:"ଆଡମିନ୍ ଡ୍ୟାସବୋର୍ଡ", logout:"ସାଇନ୍ ଆଉଟ୍",
    name:"ପୂରା ନାମ", mobile:"ମୋବାଇଲ୍ ନମ୍ବର", email:"ଇମେଲ୍ (ଇଚ୍ଛାଧୀନ)", service:"ସେବା ବାଛନ୍ତୁ", quantity:"ପରିମାଣ / ପୃଷ୍ଠା", date:"ପସନ୍ଦର ତାରିଖ", time:"ସଂଗ୍ରହ ସମୟ", notes:"ଅତିରିକ୍ତ ନିର୍ଦ୍ଦେଶ", upload:"ଡକ୍ୟୁମେଣ୍ଟ ଅପଲୋଡ୍ (ଇଚ୍ଛାଧୀନ)", submit:"ବୁକିଂ ଅନୁରୋଧ ପଠାନ୍ତୁ",
    paymentTitle:"PhonePe ଦ୍ୱାରା ଦେୟ", paymentDesc:"ସମ୍ପୂର୍ଣ୍ଣ ଅଗ୍ରିମ ଦେୟ ଦିଅନ୍ତୁ। ଦୋକାନ ଦେୟ ଯାଞ୍ଚ କରିବା ପରେ ହିଁ ବୁକିଂ ନିଶ୍ଚିତ ହେବ।",
    copyUpi:"UPI ID କପି କରନ୍ତୁ", txn:"UPI ଟ୍ରାଞ୍ଜାକ୍ସନ୍ ID", screenshot:"ପେମେଣ୍ଟ ସ୍କ୍ରିନସଟ୍", sendPayment:"ପେମେଣ୍ଟ ବିବରଣୀ ପଠାନ୍ତୁ",
    pending:"ଦେୟ ବାକି", submitted:"ଦେୟ ଦାଖଲ", verified:"ଦେୟ ଯାଞ୍ଚ", confirmed:"ନିଶ୍ଚିତ", processing:"ପ୍ରକ୍ରିୟା ଚାଲୁଛି", ready:"ସଂଗ୍ରହ ପାଇଁ ପ୍ରସ୍ତୁତ", completed:"ସମ୍ପୂର୍ଣ୍ଣ", cancelled:"ବାତିଲ୍",
    oneDay:"ଦୟାକରି ଅତି କମରେ ଗୋଟିଏ ଦିନ ପୂର୍ବରୁ ବୁକ୍ କରନ୍ତୁ। ବୁକିଂ ନିଶ୍ଚିତ ପାଇଁ ସମ୍ପୂର୍ଣ୍ଣ ଅଗ୍ରିମ ଦେୟ ଆବଶ୍ୟକ।",
    government:"ସରକାରୀ ପ୍ରମାଣପତ୍ର ସମ୍ପୃକ୍ତ କର୍ତ୍ତୃପକ୍ଷଙ୍କ ଅନୁମୋଦନ ଉପରେ ନିର୍ଭର କରେ। ସରକାରୀ ଶୁଳ୍କ ଥିଲେ ଅଲଗା ଦେବାକୁ ପଡ଼ିବ।",
    signGoogle:"Google ଦ୍ୱାରା ଜାରି ରଖନ୍ତୁ", sendOtp:"OTP ପଠାନ୍ତୁ", verifyOtp:"OTP ଯାଞ୍ଚ କରନ୍ତୁ", otp:"OTP ଲେଖନ୍ତୁ", phoneHint:"+91 ସହିତ ଆପଣଙ୍କ ୧୦ ଅଙ୍କର ମୋବାଇଲ୍ ନମ୍ବର ଦିଅନ୍ତୁ।",
    trackId:"ବୁକିଂ ID", trackPhone:"ବୁକିଂର ମୋବାଇଲ୍ ନମ୍ବର", find:"ବୁକିଂ ଖୋଜନ୍ତୁ", noBooking:"କୌଣସି ବୁକିଂ ମିଳିଲା ନାହିଁ।",
    features:["ସୁଲଭ ମୂଲ୍ୟ","ସହଜ ଅନଲାଇନ୍ ବୁକିଂ","ସ୍ଥାନୀୟ ଗ୍ରାହକ ସହାୟତା","ଏକ ସ୍ଥାନରେ ଅନେକ ସେବା"],
    footer:"ଡିଜିଟାଲ୍ ଓ ଡକ୍ୟୁମେଣ୍ଟ ସେବା ପାଇଁ ଆପଣଙ୍କ ବିଶ୍ୱସ୍ତ ସାଥୀ।"
  }
};
function App(){
  const [lang,setLang]=useState(localStorage.getItem("kc-lang")||"en");
  const t=copy[lang], [user,setUser]=useState(null), [profile,setProfile]=useState({});
  const [section,setSection]=useState("home"), [selected,setSelected]=useState(""), [menu,setMenu]=useState(false);
  const [notice,setNotice]=useState(""), [bookings,setBookings]=useState([]), [allBookings,setAllBookings]=useState([]);
  const [phone,setPhone]=useState(""), [otp,setOtp]=useState(""), [confirmation,setConfirmation]=useState(null);
  const [trackId,setTrackId]=useState(""), [trackPhone,setTrackPhone]=useState(""), [tracked,setTracked]=useState(null);
  const [form,setForm]=useState({name:"",mobile:"",email:"",service:"",quantity:1,date:"",time:"",notes:""});
  const [docFile,setDocFile]=useState(null), [paymentFile,setPaymentFile]=useState(null), [txn,setTxn]=useState("");
  const [activeBooking,setActiveBooking]=useState(null), [adminSearch,setAdminSearch]=useState("");
  const isAdmin=!!user && !!ADMIN_EMAIL && user.email?.toLowerCase()===ADMIN_EMAIL;
  const selectedService=serviceData.find(s=>s[0]===form.service);
  const estimated=selectedService && fixedPrices[selectedService[0]] ? fixedPrices[selectedService[0]]*Math.max(1,Number(form.quantity)||1) : null;
  const today=new Date(); today.setDate(today.getDate()+1); const minDate=today.toISOString().slice(0,10);

  useEffect(()=>{localStorage.setItem("kc-lang",lang)},[lang]);
  useEffect(()=>{if(!auth)return onAuthStateChanged(auth, async u=>{setUser(u); if(u){const snap=await getDoc(doc(db,"customers",u.uid));setProfile(snap.exists()?snap.data():{name:u.displayName||"",email:u.email||"",mobile:u.phoneNumber||""});}})},[]);
  useEffect(()=>{if(!user||!db)return;const q=query(collection(db,"bookings"),where("uid","==",user.uid),orderBy("createdAt","desc"));return onSnapshot(q,s=>setBookings(s.docs.map(d=>({id:d.id,...d.data()}))))},[user]);
  useEffect(()=>{if(!isAdmin||!db)return;return onSnapshot(query(collection(db,"bookings"),orderBy("createdAt","desc")),s=>setAllBookings(s.docs.map(d=>({id:d.id,...d.data()}))))},[isAdmin]);
  const toast=m=>{setNotice(m);setTimeout(()=>setNotice(""),4500)};
  const go=s=>{setSection(s);setMenu(false);window.scrollTo({top:0,behavior:"smooth"})};
  const loginGoogle=async()=>{try{const r=await signInWithPopup(auth,googleProvider);await setDoc(doc(db,"customers",r.user.uid),{name:r.user.displayName||"",email:r.user.email||"",mobile:r.user.phoneNumber||"",updatedAt:serverTimestamp()},{merge:true});go("dashboard")}catch(e){toast(e.message)}};
  const sendOtp=async()=>{try{if(!phone.match(/^\+?[1-9]\d{9,14}$/))return toast("Enter a valid phone number with country code, e.g. +916371728063");if(!window.kcRecaptcha)window.kcRecaptcha=new RecaptchaVerifier(auth,"recaptcha-container",{size:"invisible"});setConfirmation(await signInWithPhoneNumber(auth,phone.startsWith("+")?phone:"+91"+phone,window.kcRecaptcha));toast("OTP sent.")}catch(e){toast(e.message)}};
  const verifyOtp=async()=>{try{const r=await confirmation.confirm(otp);await setDoc(doc(db,"customers",r.user.uid),{name:r.user.displayName||"",email:r.user.email||"",mobile:r.user.phoneNumber||phone,updatedAt:serverTimestamp()},{merge:true});go("dashboard")}catch(e){toast("OTP verification failed. Please try again.")}};
  const makeBooking=async e=>{e.preventDefault();if(!user)return toast("Please sign in before booking.");if(!form.date||form.date<minDate)return toast("Bookings must be made at least one day in advance.");if(!form.service)return toast("Please select a service.");try{
    const bookingRef=doc(collection(db,"bookings"));const bookingId="KC"+new Date().getFullYear()+bookingRef.id.slice(0,6).toUpperCase();
    let documentUrl="";if(docFile){if(docFile.size>10*1024*1024)throw new Error("Document must be smaller than 10 MB.");const r=ref(storage,`customer-files/${user.uid}/${bookingRef.id}/${docFile.name}`);await uploadBytes(r,docFile);documentUrl=await getDownloadURL(r)}
    const service=serviceData.find(s=>s[0]===form.service);
    await setDoc(bookingRef,{bookingId,uid:user.uid,name:form.name||profile.name||user.displayName||"",mobile:form.mobile||profile.mobile||user.phoneNumber||"",email:form.email||user.email||"",serviceId:service[0],serviceName:lang==="od"?service[2]:service[1],quantity:Number(form.quantity)||1,preferredDate:form.date,preferredTime:form.time,notes:form.notes||"",documentUrl,estimatedAmount:estimated,status:"Pending Payment",paymentStatus:"Pending",createdAt:serverTimestamp()});
    setActiveBooking({id:bookingRef.id,bookingId,estimatedAmount:estimated});setForm({...form,service:""});setDocFile(null);go("payment");toast("Booking request created. Complete payment submission.");}
    catch(e){toast(e.message||"Could not create booking. Check Firebase setup.")}};
  const submitPayment=async e=>{e.preventDefault();if(!activeBooking||!user)return;try{let screenshotUrl="";if(paymentFile){if(paymentFile.size>5*1024*1024)throw new Error("Screenshot must be smaller than 5 MB.");const r=ref(storage,`payment-proofs/${user.uid}/${activeBooking.id}/${paymentFile.name}`);await uploadBytes(r,paymentFile);screenshotUrl=await getDownloadURL(r)}
    await updateDoc(doc(db,"bookings",activeBooking.id),{transactionId:txn,screenshotUrl,paymentStatus:"Submitted",status:"Payment Submitted",paymentSubmittedAt:serverTimestamp()});toast("Payment details submitted for verification.");go("dashboard");}
    catch(e){toast(e.message)}};
  const track=async e=>{e.preventDefault();try{const q=query(collection(db,"bookings"),where("bookingId","==",trackId.trim()),where("mobile","==",trackPhone.trim()));const s=await getDocs(q);setTracked(s.empty?false:{id:s.docs[0].id,...s.docs[0].data()})}catch(e){toast(e.message)}};
  const updateStatus=async(b,status,paymentStatus)=>{try{await updateDoc(doc(db,"bookings",b.id),{...(status?{status}:{}),...(paymentStatus?{paymentStatus}:{}),updatedAt:serverTimestamp()});toast("Booking updated.")}catch(e){toast(e.message)}};
  const nav=t.nav;
  const priceLabel=s=>s[3];
  const serviceCard=s=><article className="service-card" key={s[0]}><div className="service-icon"><FileText size={22}/></div><span className="tag">{s[6]}</span><h3>{lang==="od"?s[2]:s[1]}</h3><div className="service-bottom"><strong>{priceLabel(s)}</strong><button className="text-button" onClick={()=>{setForm({...form,service:s[0]});go("book")}}>{t.book} <ArrowRight size={15}/></button></div></article>;
  if(!firebaseReady)return <div className="setup-screen"><div className="brand-mark">KC</div><h1>Kanhu Communication</h1><p>Website starter is ready. Add your Firebase project settings to connect customer accounts, bookings and document uploads.</p><div className="setup-box"><b>Quick setup required</b><ol><li>Copy <code>.env.example</code> to <code>.env</code>.</li><li>Enter your Firebase web app configuration.</li><li>Enable Phone and Google sign-in providers.</li><li>Deploy the Firestore and Storage rules in the <code>firebase</code> folder.</li></ol></div></div>;
  return <div>
    <header className="header"><a className="logo" onClick={()=>go("home")}><span className="logo-icon">KC</span><span>Kanhu<span className="logo-light"> Communication</span><small>Digital Service Centre</small></span></a>
      <button className="mobile-menu" onClick={()=>setMenu(!menu)}><Menu/></button>
      <nav className={menu?"nav open":"nav"}>{nav.map((n,i)=><button key={n} onClick={()=>go(["home","services","prices","book","track","about","contact"][i])}>{n}</button>)}</nav>
      <div className="header-actions"><button className="language" onClick={()=>setLang(lang==="en"?"od":"en")}><Globe2 size={16}/>{lang==="en"?"ଓଡ଼ିଆ":"English"}</button>{user?<button className="login-btn" onClick={()=>go(isAdmin?"admin":"dashboard")}><User size={16}/>{isAdmin?t.admin:t.dashboard}</button>:<button className="login-btn" onClick={()=>go("login")}>{t.login}</button>}</div>
    </header>
    <main>
      {section==="home"&&<><section className="hero"><div className="hero-copy"><span className="eyebrow"><span className="pulse"></span>{t.eyebrow}</span><h1>{t.title}<br/><em>{t.highlight}</em></h1><p>{t.desc}</p><div className="hero-actions"><button className="primary" onClick={()=>go("book")}>{t.book}<ArrowRight size={17}/></button><button className="secondary" onClick={()=>go("services")}>{t.explore}</button></div><div className="hero-proof"><span><ShieldCheck size={17}/> Trusted local service</span><span><Clock3 size={17}/> Advance booking</span></div></div><div className="hero-art"><div className="art-glow"></div><div className="paper paper-back"><FileText/></div><div className="paper paper-front"><Printer size={48}/><b>PRINT<br/> & DIGITAL</b><span>One stop service</span></div><div className="float-chip chip-one"><ScanLine/> Scan & Copy</div><div className="float-chip chip-two"><BadgeCheck/> Online Services</div></div></section>
      <section className="feature-strip">{t.features.map((f,i)=><div key={f}><span className="feature-icon">{[<IndianRupee/>,<CalendarDays/>,<Headphones/>,<FileCheck2/>][i]}</span><b>{f}</b></div>)}</section>
      <section className="section"><div className="section-heading"><div><span className="eyebrow">WHAT WE OFFER</span><h2>{t.why}</h2><p>{t.whyDesc}</p></div><button className="text-button" onClick={()=>go("services")}>{t.explore}<ArrowRight size={16}/></button></div><div className="service-grid">{serviceData.slice(0,8).map(serviceCard)}</div></section>
      <section className="cta-band"><div><span className="eyebrow">SIMPLE. LOCAL. RELIABLE.</span><h2>{t.bookTitle}</h2><p>{t.oneDay}</p></div><button className="primary light" onClick={()=>go("book")}>{t.book}<ArrowRight/></button></section></>}
      {section==="services"&&<section className="section page-section"><span className="eyebrow">KANHU COMMUNICATION</span><h1>{t.services}</h1><p className="lead">{t.servicesDesc}</p>{["Printing & Documents","Government Services","Education","Other Services"].map(cat=><div className="category" key={cat}><h2>{cat}</h2><div className="service-grid">{serviceData.filter(s=>s[6]===cat).map(serviceCard)}</div></div>)}</section>}
      {section==="prices"&&<section className="section page-section"><span className="eyebrow">TRANSPARENT PRICING</span><h1>{t.prices}</h1><p className="lead">{t.priceDesc}</p><div className="price-table"><div className="price-head"><span>Service / ସେବା</span><span>Price / ମୂଲ୍ୟ</span><span></span></div>{serviceData.map(s=><div className="price-row" key={s[0]}><span>{lang==="od"?s[2]:s[1]}</span><b>{s[3]}</b><button onClick={()=>{setForm({...form,service:s[0]});go("book")}}>Book</button></div>)}</div><p className="notice">{t.government}</p></section>}
      {section==="book"&&<section className="section page-section narrow"><span className="eyebrow">ONLINE REQUEST</span><h1>{t.bookTitle}</h1><p className="lead">{t.bookDesc}</p><div className="notice warning"><Clock3/>{t.oneDay}</div>{!user?<div className="login-prompt"><h3>{t.login}</h3><p>Please sign in to submit and track your booking.</p><button className="primary" onClick={()=>go("login")}>{t.login}<ArrowRight/></button></div>:<form className="form-card" onSubmit={makeBooking}><div className="form-grid"><label>{t.name}<input required value={form.name||profile.name||user.displayName||""} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>{t.mobile}<input required value={form.mobile||profile.mobile||user.phoneNumber||""} onChange={e=>setForm({...form,mobile:e.target.value})} placeholder="10-digit mobile number"/></label><label>{t.email}<input type="email" value={form.email||user.email||""} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>{t.service}<select required value={form.service} onChange={e=>setForm({...form,service:e.target.value})}><option value="">Choose a service</option>{serviceData.map(s=><option value={s[0]} key={s[0]}>{lang==="od"?s[2]:s[1]}</option>)}</select></label><label>{t.quantity}<input type="number" min="1" max="500" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})}/></label><label>{t.date}<input type="date" min={minDate} required value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label><label>{t.time}<select value={form.time} onChange={e=>setForm({...form,time:e.target.value})}><option value="">Select time</option>{["09:00 AM","10:00 AM","11:00 AM","12:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM","06:00 PM"].map(x=><option>{x}</option>)}</select></label><label className="full">{t.upload}<input type="file" onChange={e=>setDocFile(e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"/></label><label className="full">{t.notes}<textarea rows="3" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label></div><div className="estimate"><span>Estimated service charge</span><strong>{estimated===null?"To be confirmed":`₹${estimated.toFixed(2)}`}</strong></div><p className="small-note">{t.government}</p><button className="primary full-button" type="submit">{t.submit}<ArrowRight/></button></form>}</section>}
      {section==="payment"&&<section className="section page-section narrow"><span className="eyebrow">ADVANCE PAYMENT</span><h1>{t.paymentTitle}</h1><p className="lead">{t.paymentDesc}</p><div className="payment-card"><div className="phonepe-brand"><span>पे</span><b>PhonePe</b></div><img className="qr" src="/phonepe-qr.png" alt="Kanhu Communication PhonePe QR code"/><b className="payee">KANHU CHARAN BHOI</b><div className="upi-line"><code>{UPI}</code><button className="secondary" onClick={()=>{navigator.clipboard.writeText(UPI);toast("UPI ID copied.")}}>{t.copyUpi}</button></div>{activeBooking?.estimatedAmount!==null&&<div className="estimate"><span>Estimated amount</span><strong>₹{Number(activeBooking?.estimatedAmount||0).toFixed(2)}</strong></div>}</div><form className="form-card" onSubmit={submitPayment}><label>{t.txn}<input required value={txn} onChange={e=>setTxn(e.target.value)}/></label><label>{t.screenshot}<input type="file" required accept="image/*" onChange={e=>setPaymentFile(e.target.files[0])}/></label><button className="primary full-button">{t.sendPayment}<ArrowRight/></button><p className="small-note">Your payment will be checked by the shop owner. Do not share your UPI PIN or OTP.</p></form></section>}
      {section==="login"&&<section className="section page-section narrow"><span className="eyebrow">CUSTOMER ACCOUNT</span><h1>{t.login}</h1><p className="lead">Access your bookings, payment history and service updates.</p><div className="form-card login-card"><button className="google-btn" onClick={loginGoogle}><b>G</b>{t.signGoogle}</button><div className="or"><span>OR</span></div><label>{t.mobile}<input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+916371728063"/></label><p className="small-note">{t.phoneHint}</p><div id="recaptcha-container"></div>{!confirmation?<button className="primary full-button" onClick={sendOtp}>{t.sendOtp}</button>:<><label>{t.otp}<input value={otp} onChange={e=>setOtp(e.target.value)} inputMode="numeric"/></label><button className="primary full-button" onClick={verifyOtp}>{t.verifyOtp}</button></>}</div></section>}
      {section==="track"&&<section className="section page-section narrow"><span className="eyebrow">BOOKING STATUS</span><h1>{t.track}</h1><p className="lead">{t.trackDesc}</p><form className="form-card" onSubmit={track}><label>{t.trackId}<input required value={trackId} onChange={e=>setTrackId(e.target.value)} placeholder="KC2026ABC123"/></label><label>{t.trackPhone}<input required value={trackPhone} onChange={e=>setTrackPhone(e.target.value)}/></label><button className="primary full-button">{t.find}<Search/></button></form>{tracked&&<div className="booking-card"><b>{tracked.bookingId}</b><h3>{tracked.serviceName}</h3><Status status={tracked.status}/><p>Preferred date: {tracked.preferredDate}</p><p>Payment: {tracked.paymentStatus}</p></div>}{tracked===false&&<p className="notice">{t.noBooking}</p>}</section>}
      {section==="dashboard"&&<section className="section page-section"><span className="eyebrow">CUSTOMER PORTAL</span><h1>{t.dashboard}</h1><div className="dashboard-top"><div><b>{user?.displayName||profile.name||user?.email}</b><p>{user?.phoneNumber||profile.mobile||user?.email}</p></div><button className="secondary" onClick={()=>signOut(auth).then(()=>go("home"))}>{t.logout}</button></div><div className="dashboard-actions"><button className="primary" onClick={()=>go("book")}>{t.book}<ArrowRight/></button></div><h2>My bookings</h2><div className="booking-list">{bookings.map(b=><div className="booking-card" key={b.id}><div className="booking-card-top"><b>{b.bookingId}</b><Status status={b.status}/></div><h3>{b.serviceName}</h3><p>Preferred date: {b.preferredDate} · Payment: {b.paymentStatus}</p>{b.estimatedAmount!==null&&<strong>₹{Number(b.estimatedAmount).toFixed(2)}</strong>}{b.status==="Pending Payment"&&<button className="text-button" onClick={()=>{setActiveBooking({id:b.id,bookingId:b.bookingId,estimatedAmount:b.estimatedAmount});go("payment")}}>Complete payment <ArrowRight size={15}/></button>}</div>)}</div></section>}
      {section==="admin"&&isAdmin&&<section className="section page-section"><span className="eyebrow">PRIVATE OWNER AREA</span><h1>{t.admin}</h1><div className="admin-stats"><div><span>Total bookings</span><b>{allBookings.length}</b></div><div><span>Pending payments</span><b>{allBookings.filter(b=>b.paymentStatus!=="Verified").length}</b></div><div><span>Completed</span><b>{allBookings.filter(b=>b.status==="Completed").length}</b></div></div><input className="search-input" placeholder="Search by booking ID, customer or mobile" value={adminSearch} onChange={e=>setAdminSearch(e.target.value)}/><div className="booking-list">{allBookings.filter(b=>(b.bookingId+b.name+b.mobile).toLowerCase().includes(adminSearch.toLowerCase())).map(b=><div className="booking-card" key={b.id}><div className="booking-card-top"><b>{b.bookingId}</b><Status status={b.status}/></div><h3>{b.name} · {b.serviceName}</h3><p>{b.mobile} · {b.preferredDate} · {b.paymentStatus}</p>{b.estimatedAmount!==null&&<strong>₹{Number(b.estimatedAmount).toFixed(2)}</strong>}{b.documentUrl&&<a href={b.documentUrl} target="_blank" rel="noreferrer">View customer document</a>}{b.screenshotUrl&&<a href={b.screenshotUrl} target="_blank" rel="noreferrer">View payment screenshot</a>}{b.paymentStatus!=="Verified"&&<button className="primary small-btn" onClick={()=>updateStatus(b,"Confirmed","Verified")}>Verify payment & confirm</button>}<label className="admin-status">Update status<select value={b.status} onChange={e=>updateStatus(b,e.target.value)}>{["Pending Payment","Payment Submitted","Payment Verified","Confirmed","Processing","Ready for Collection","Completed","Cancelled"].map(s=><option>{s}</option>)}</select></label></div>)}</div><button className="secondary" onClick={()=>signOut(auth).then(()=>go("home"))}>{t.logout}</button></section>}
      {section==="about"&&<section className="section page-section narrow"><span className="eyebrow">WHO WE ARE</span><h1>{t.about}</h1><p className="lead">{t.aboutText}</p><div className="about-points">{t.features.map(x=><div><CheckCircle2/>{x}</div>)}</div></section>}
      {section==="contact"&&<section className="section page-section narrow"><span className="eyebrow">GET IN TOUCH</span><h1>{t.contact}</h1><p className="lead">{t.contactDesc}</p><div className="contact-card"><p><MapPin/>Baghabaspur, Gopalprasad, Talcher, Angul, Odisha - 759103</p><p><Phone/><a href={`tel:${PHONE}`}>{PHONE}</a> / <a href={`tel:${ALT_PHONE}`}>{ALT_PHONE}</a></p><p><MessageCircle/><a href={`https://wa.me/91${PHONE}`} target="_blank" rel="noreferrer">Chat on WhatsApp</a></p><p><Smartphone/>{UPI}</p><p><Headphones/><a href={`mailto:${EMAIL}`}>{EMAIL}</a></p></div></section>}
    </main>
    <footer className="footer"><div className="footer-main"><div className="logo footer-logo"><span className="logo-icon">KC</span><span>Kanhu Communication<small>{t.footer}</small></span></div><div><b>Quick links</b><button onClick={()=>go("services")}>Services</button><button onClick={()=>go("prices")}>Price List</button><button onClick={()=>go("book")}>Book Now</button></div><div><b>Contact</b><span>{PHONE} / {ALT_PHONE}</span><span>{EMAIL}</span><span>Baghabaspur, Talcher, Odisha</span></div></div><div className="footer-bottom">© {new Date().getFullYear()} Kanhu Communication. All rights reserved.</div></footer>
    <a className="whatsapp-float" href={`https://wa.me/91${PHONE}?text=${encodeURIComponent("Hello Kanhu Communication, I would like to enquire about your services.")}`} target="_blank" rel="noreferrer"><MessageCircle/> <span>WhatsApp</span></a>
    {notice&&<div className="toast">{notice}<button onClick={()=>setNotice("")}><X size={15}/></button></div>}
    {!user&&section==="admin"&&<div className="section"><p>Admin sign-in required.</p><button onClick={()=>go("login")}>Sign in</button></div>}
    <div className="sr-only" aria-live="polite">{notice}</div>
  </div>
}
function Status({status}){return <span className={"status status-"+String(status||"").toLowerCase().replaceAll(" ","-")}>{status}</span>}
createRoot(document.getElementById("root")).render(<App/>);
