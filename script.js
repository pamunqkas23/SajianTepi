// ===== DATA =====
let kategori = JSON.parse(localStorage.getItem("kategori")) || ["Minuman","Makanan"];
let barang = JSON.parse(localStorage.getItem("barang")) || [];
let riwayat = JSON.parse(localStorage.getItem("riwayat")) || [];
let keranjang = JSON.parse(localStorage.getItem("keranjang")) || [];

const defaultAdminPin = "1234";

// ===== LOGIN / LOGOUT =====
function login(role){
    if(role==="admin"){
        const pin = document.getElementById("adminPinInput").value;
        if(pin !== defaultAdminPin){ alert("PIN salah!"); return; }
        document.getElementById("adminLoginPage").style.display="none";
        document.getElementById("adminPinInput").value="";
    }
    localStorage.setItem("sessionRole", role);
    document.getElementById("homePage").style.display="none";

    if(role==="admin"){
        document.getElementById("adminPanel").style.display="block";
        updateKategoriOptions();
        updateHapusBarangOptions();
        tampilkanRiwayat();
    } else {
        document.getElementById("kasirPanel").style.display="block";
        updateKategoriKasir();
        tampilkanBarang();
        tampilkanKeranjang();
    }
}

function showAdminLogin(){
    document.getElementById("homePage").style.display="none";
    document.getElementById("adminLoginPage").style.display="flex";
}
function backHome(){
    document.getElementById("adminLoginPage").style.display="none";
    document.getElementById("homePage").style.display="flex";
}

function logout(){
    localStorage.removeItem("sessionRole");
    document.getElementById("homePage").style.display="flex";
    document.getElementById("adminPanel").style.display="none";
    document.getElementById("kasirPanel").style.display="none";
    keranjang=[];
    localStorage.setItem("keranjang", JSON.stringify(keranjang));
    document.getElementById("bayar").value="";
    document.getElementById("kembalian").textContent=formatRupiah(0);
}

// ===== PERSISTENT SESSION =====
window.onload = function(){
    let sessionRole = localStorage.getItem("sessionRole");
    if(sessionRole) login(sessionRole);
}

// ===== UTILITY =====
function formatRupiah(angka){
    return "Rp"+angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g,".");
}

function formatRupiahInput(val){
    return val.replace(/\D/g,'').replace(/\B(?=(\d{3})+(?!\d))/g,'.');
}

// ===== ADMIN =====
function updateKategoriOptions(){
    let select=document.getElementById("kategoriSelect");
    select.innerHTML="";
    kategori.forEach(k=>{
        let opt=document.createElement("option");
        opt.value=k; opt.textContent=k;
        select.appendChild(opt);
    });
}

function updateHapusBarangOptions(){
    let select=document.getElementById("hapusBarangSelect");
    select.innerHTML="";
    barang.forEach(b=>{
        let opt=document.createElement("option");
        opt.value=b.nama;
        opt.textContent=`${b.nama} (${b.kategori})`;
        select.appendChild(opt);
    });
}

function tambahBarang(){
    let kat=document.getElementById("kategoriSelect").value;
    let nama=document.getElementById("barangInput").value;
    let harga = parseInt(document.getElementById("hargaInput").value.replace(/\./g,'')) || 0;
    barang.push({nama:nama,kategori:kat,harga:harga});
    localStorage.setItem("barang",JSON.stringify(barang));
    updateHapusBarangOptions();
    document.getElementById("barangInput").value="";
    document.getElementById("hargaInput").value="";
    alert("Barang berhasil ditambahkan!");
}

function hapusBarang(){
    let nama=document.getElementById("hapusBarangSelect").value;
    barang=barang.filter(b=>b.nama!==nama);
    localStorage.setItem("barang",JSON.stringify(barang));
    updateHapusBarangOptions();
    alert("Barang berhasil dihapus!");
}

// ===== KASIR =====
function updateKategoriKasir(){
    let select=document.getElementById("kategoriKasir");
    select.innerHTML="<option value='ALL'>ALL</option>";
    kategori.forEach(k=>{
        let opt=document.createElement("option");
        opt.value=k; opt.textContent=k;
        select.appendChild(opt);
    });
}

function tampilkanBarang(){
    let daftar=document.getElementById("daftarBarang");
    daftar.innerHTML="";
    let kat=document.getElementById("kategoriKasir").value;
    let search=document.getElementById("cariBarang").value.toLowerCase();
    let filtered=barang.filter(b=>(kat==="ALL"||b.kategori===kat)&&b.nama.toLowerCase().includes(search));

    filtered.forEach(b=>{
        let li=document.createElement("li");
        let nama=document.createElement("span"); nama.textContent=b.nama; nama.classList.add("daftar-barang-nama");
        let harga=document.createElement("span"); harga.textContent=formatRupiah(b.harga); harga.classList.add("daftar-barang-harga");
        let btnDiv=document.createElement("div"); btnDiv.classList.add("daftar-barang-btn");
        let btn=document.createElement("button"); btn.textContent="+"; btn.onclick=()=>tambahKeKeranjang(b);
        btnDiv.appendChild(btn);
        li.appendChild(nama); li.appendChild(harga); li.appendChild(btnDiv);
        daftar.appendChild(li);
    });
}

// ===== KERANJANG =====
function tambahKeKeranjang(item){
    let index=keranjang.findIndex(k=>k.nama===item.nama);
    if(index!==-1) keranjang[index].qty+=1;
    else keranjang.push({...item, qty:1});
    localStorage.setItem("keranjang",JSON.stringify(keranjang));
    tampilkanKeranjang();
}

function tampilkanKeranjang(){
    let list=document.getElementById("keranjangList");
    list.innerHTML="";
    keranjang.forEach((item,index)=>{
        let li=document.createElement("li");
        li.classList.add("keranjang-item");
        let nama=document.createElement("span"); nama.textContent=item.nama; nama.classList.add("keranjang-nama");
        let harga=document.createElement("span"); harga.textContent=formatRupiah(item.harga*item.qty); harga.classList.add("keranjang-harga");
        let qtyDiv=document.createElement("div"); qtyDiv.classList.add("keranjang-qty");
        let btnMinus=document.createElement("button"); btnMinus.textContent="-"; 
        btnMinus.onclick=()=>{
            item.qty--; 
            if(item.qty<=0) keranjang.splice(index,1); 
            localStorage.setItem("keranjang",JSON.stringify(keranjang));
            tampilkanKeranjang();
        }
        let qtySpan=document.createElement("span"); qtySpan.textContent=item.qty;
        let btnPlus=document.createElement("button"); btnPlus.textContent="+"; 
        btnPlus.onclick=()=>{
            item.qty++;
            localStorage.setItem("keranjang",JSON.stringify(keranjang));
            tampilkanKeranjang();
        }
        qtyDiv.appendChild(btnMinus); qtyDiv.appendChild(qtySpan); qtyDiv.appendChild(btnPlus);
        li.appendChild(nama); li.appendChild(harga); li.appendChild(qtyDiv);
        list.appendChild(li);
    });
    updateTotal();
    updateKembalian();
}

function updateTotal(){
    let total=keranjang.reduce((sum,item)=>sum+item.harga*item.qty,0);
    document.getElementById("totalHarga").textContent=formatRupiah(total);
}

// ===== PEMBAYARAN =====
document.getElementById("bayar").addEventListener("input", function(){
    this.value = formatRupiahInput(this.value);
    updateKembalian();
});

function updateKembalian(){
    let bayar=parseInt(document.getElementById("bayar").value.replace(/\./g,''))||0;
    let total=keranjang.reduce((sum,item)=>sum+item.harga*item.qty,0);
    let kembali=bayar-total;
    document.getElementById("kembalian").textContent=formatRupiah(Math.max(kembali,0));
}

function prosesBayar(){
    let bayar=parseInt(document.getElementById("bayar").value.replace(/\./g,''))||0;
    let total=keranjang.reduce((sum,item)=>sum+item.harga*item.qty,0);
    if(bayar>=total && keranjang.length>0){
        let now=new Date();
        let tanggal=now.toLocaleDateString();
        let jam=now.toLocaleTimeString();
        riwayat.push({items:[...keranjang], total:total, tanggal:tanggal, jam:jam});
        localStorage.setItem("riwayat",JSON.stringify(riwayat));
        keranjang=[]; localStorage.setItem("keranjang",JSON.stringify(keranjang));
        tampilkanKeranjang();
        tampilkanRiwayat();
        document.getElementById("bayar").value="";
        document.getElementById("kembalian").textContent=formatRupiah(0);
        alert("Transaksi berhasil!");
    } else {
        alert("Uang bayar kurang atau keranjang kosong!");
    }
}

// ===== RIWAYAT =====
function tampilkanRiwayat(){
    let list=document.getElementById("riwayatList"); list.innerHTML="";
    riwayat.forEach((tr,index)=>{
        let li=document.createElement("li");
        li.textContent=`${tr.tanggal} ${tr.jam} - ${formatRupiah(tr.total)} `;
        let btn=document.createElement("button"); 
        btn.textContent="Hapus"; btn.style.marginLeft="10px";
        btn.onclick=()=>{ 
            riwayat.splice(index,1); 
            localStorage.setItem("riwayat",JSON.stringify(riwayat)); 
            tampilkanRiwayat(); 
        }
        li.appendChild(btn); list.appendChild(li);
    });
}

// ===== HAPUS SEMUA RIWAYAT =====
document.getElementById("hapusSemuaBtn").addEventListener("click", ()=>{
    if(confirm("Hapus semua riwayat?")){
        riwayat=[]; 
        localStorage.setItem("riwayat", JSON.stringify(riwayat)); 
        tampilkanRiwayat();
    }
});
