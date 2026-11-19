# Yantrix admin chalana seekhein

**[▶ Admin training video — Hinglish, 9 min 45 sec](yantrix-admin-hinglish.mp4)** · **[Form fields ki searchable list](fields.md)**

Yantrix institute ki website hai. Students uska public hissa dekhte hain. **Admin** aapka private kaam karne ka hissa hai: yahan aap fees badalte hain, pages update karte hain aur enquiries ka follow-up rakhte hain. Video mein chalti hui local website ka **Owner view** hai, marketing demo nahi. GitHub preview na chale to MP4 ka **Download raw file** button use karein; phone ya VLC mein khol kar pause/seek kar sakte hain.

## Video ke saath-saath karein

| Samay | Sidebar mein kya kholna hai | Ek kaam karke samjhein |
|---|---|---|
| 0:00 | Sign in | Apni site ke address ke aage `/admin` lagaayein. Office email aur password → **Continue** → inbox ka 6-digit code. Naya code maangne par purana bekaar hai. **Use a different account** email badalta hai. Production mein mail chahiye; terminal wali baat sirf local demo ki hai. |
| 0:33 | Dashboard | **Live courses**, **Published FAQs**, **Hero slides** ya **New enquiries** card kholiye. Latest enquiries mein **View all** se poori list milegi. **Open SEO settings** health checklist par kaam karne ke liye hai. Mobile par **Open menu**, phir panel ka naam tap karein. |
| 0:54 | Hero slides | **Add slide** → small label, headline, description, image aur alt text → **Add item**. Pencil se kholne par **Save changes**. Banner ke CTA button ka *label* yahan nahi, **Pages & navigation → Home page** mein hai. |
| 1:38 | Courses | Search naam, slug, level ya mode se karein. **Edit** maujooda course badalta hai; **Add course** naya page banata hai. Niche saat tabs ka naksha hai. **Copy link** address deta hai; **View page** result dikhata hai. **Fill new sections** catalogue ke purane courses ke khaali fields mein starter copy bhar sakta hai; ye preview nahi hai. |
| 2:54 | FAQs | **Add question** → ek sawaal aur seedha jawaab → **Add item**. List mein nayi entry dekhein. Ye home FAQs hain. Kisi ek course ka sawaal uske apne editor mein jaata hai. |
| 3:14 | Trainers | Upar **Section settings** ki heading/visibility save karein. Neeche **Add mentor** se photo, naam, company, designation, specialisation, experience, bio aur skills wala alag form khulta hai. Ek role, qualification ya skill per line. |
| 3:37 | Placed students | **Add placed student** → permission wala naam, company, job role, course aur batch → **Add item**. Photo, package aur quote optional hain. Data verify na ho to khaali chhodein. Sirf ek profile ko hide karne aur poora section hide karne mein farq hai. |
| 3:51 | Page sections | **Section headings** poore block ka eyebrow (heading ke upar chhota label), heading, description aur **Hide this section** badalta hai. Baaki 19 tabs **andar ke items** badalte hain. Har tab ka exact Add form [field list](fields.md) mein hai. |
| 4:57 | Pages & navigation | Home, brochure, app, courses, about aur contact ki page copy edit karke **Save changes**. Neeche **Main navigation → Add link** mein label + page. **Footer quick links** mein optional anchor, jaise `gallery`. Header/footer lists ka save alag hai. |
| 5:25 | Interface text | Button ya badge ka *naam* badalna hai, uska action nahi? Group chunein ya browser **Find** se label dhoondhein. Default hint padhein; template placeholders rakhein. **Save changes**. Shared label badalne par kai jagah text badal sakta hai. |
| 5:39 | Media library | **Choose images** ya drag-and-drop (JPG, PNG, WebP, GIF; UI limit 4 MB/image). **Refresh** list reload karta hai. Preview ke neeche **Copy URL** se wahi image dobara use karein. Library ka bin file delete karta hai, sirf ek page se nahi hatata. |
| 5:58 | SEO · AEO · GEO | Global default title/description aur share image → local area/coordinates → har page ka title, path aur description → AI facts/schema → **Save changes**. Main website URL **Site settings → Brand** mein hai. **noindex** search se page hata sakta hai. ID ke badle password/API secret na daalein. |
| 6:57 | Enquiries | Naam par click → message, phone, email → **Internal notes → Save notes**. Row dropdown se **new / contacted / enrolled / closed**. Upar wala dropdown sirf filter hai, status badalta nahi. **Export CSV** current filtered rows export karta hai; sab chahiye to search aur filter hataayein. |
| 7:37 | Email notifications | Sending status aur dono previews dekhein. SMTP ready ho tab **Send test emails to me** dono samples signed-in admin ko bhejta hai. Production ke SMTP secrets server team set karti hai, is screen par nahi. Demo mein mail send nahi kiya gaya. |
| 7:56 | Admin users | Owner: **Add admin** → name, email, temporary password (kam se kam 8 characters), role → **Create account**. Eye password dikhata/chhupata hai. Role dropdown rights badalta hai; **Active / Disabled** access temporarily rokta/chalu karta hai. Doosre user ka **Reset password** aur **Remove admin** alag actions hain. |
| 8:38 | Site settings | Brand → Contact details → WhatsApp → Social profiles → Top bar & footer → Legal pages → **Save changes**. WhatsApp number digits + country code, `+`/spaces nahi. **Show refund policy** off karne se page, footer link aur sitemap entry chhupte hain. |
| 9:18 | Password, reset aur exit | **Your sign-in password**: naya password do baar → **Update password**. Owner ka **Reset all content** website ki copy aur added content ko defaults se *replace* karta hai; enquiries nahi mitti. Ye undo nahi hai. **View website** se result check karein; **Sign out** session band karta hai. |

### Courses: ek course banane ka order

1. **Basics:** naam zaroori hai. **From name** naam se link ka aakhri hissa (slug) banata hai. Existing slug badalne se purane links toot sakte hain. Cover, alt text, badge, audience, level, fee, duration, mode aur date bharein. **Published** off rakhkar adhura course hide kar sakte hain.
2. **About & highlights:** paragraphs, image, learning outcomes, benefits, specialisations aur tools. Brochure/file ke liye public PDF ka *link* dein; Media library image uploader hai. Alag files ke liye **Add syllabus file** → file name + URL.
3. **Projects & extras:** capstone aur mini project rows, What's included aur certificate ka title/text. Row ke andar ka **Remove** us row ko course se nikaalta hai; poora course delete nahi karta.
4. **Curriculum:** **Add module** → title, duration/sessions, topics (ek per line). Arrows se syllabus ka order tay karein.
5. **Batches & placement:** **Add batch** → label, mode, timing, start, seats, date (`YYYY-MM-DD`). Neeche career support aur trainer card alag hain.
6. **Reviews & FAQs:** student name, batch/role, asli quote; neeche **Add question** → question + answer. Ye sirf us course par dikhega.
7. **CTA & SEO:** closing heading/text, mobile sticky button label, WhatsApp ka prefilled message aur search title/description. Naye ke liye **Create course**, purane ke liye **Save changes**. **Cancel / All courses** bina save kiye bahar le jaate hain. Tabs ke beech jaana save nahi hai.

### Buttons aur forms ki chhoti dictionary

| Control | Kya karna hai |
|---|---|
| Add / Pencil / X | **Add** khaali ya sample form kholta hai. **Pencil** existing item kholta hai. **Add item / Save changes** se apply hota hai. Dialog ka **X / Esc** unsaved edit chhod deta hai. |
| Arrows / two pages / eye / bin | Up/down order; **Duplicate** nayi copy banata hai (phir naam badlein); **Hide / Show** reversible; **Delete** confirmation ke baad permanent. List ke ye actions turant apply hote hain. Course list mein Duplicate ki jagah Copy link hai. |
| Upload photo / Replace photo / Remove | Image field mein new file chunein ya path paste karein. **Remove** us field ka reference saaf karta hai; phir form save karein. Media library ka **Delete image** alag hai. Alt text image ka varnan hai, filename nahi. |
| Textarea / rows / pairs | Paragraph ke liye normal text. “One per line” ho to Enter se alag entries. **Add…** button ho to har item ke liye alag row. “Label \| Value” ho to har line mein ek jodi, beech mein `\|`. |
| Switch / dropdown | Switch yes/no hai; dropdown se ek option chunein. Form ke andar change ke baad save karein. Enquiry status aur account status jaise *list actions* ko alag save nahi chahiye. |
| Unsaved / Not saved | **You have unsaved changes** dikhe to usi form ka Save dabayein. Laal field ka format theek karein, error padhein, phir dobara Save. Success ke baad **View website** khol kar affected page refresh karein. |

**Pehli practice:** test site par ek FAQ banaayein, uska jawaab edit karein, home page par dekhein, phir eye se hide karke dobara check karein. Real enquiries delete karna, roles badalna ya reset dabana practice ke liye zaroori nahi hai.

**Agar aapka panel video se chhota hai:** Owner accounts sambhalta hai; Editor content aur enquiries par kaam karta hai; Viewer ki sidebar mein Dashboard aur Enquiries hote hain. Missing access ke liye owner se baat karein; kisi aur ka login na lein.

[Recording aur audit ka scope](audit.md)
