// BUP (Lithuanian National Curriculum) for Mathematics - Grades 7-8

export interface BUPSubunit {
    id: string;
    name: string;
    originalText: string;
    sentences: string[];
}

export interface BUPUnit {
    id: string;
    name: string;
    subunits: BUPSubunit[];
}

export interface BUPModule {
    id: string;
    name: string;
    units: BUPUnit[];
}

export interface BUPGrade {
    grade: number;
    modules: BUPModule[];
}

// Helper function to split text into sentences while preserving formulas
function splitIntoSentences(text: string): string[] {
    // Remove extra whitespace and normalize
    const normalized = text.replace(/\s+/g, ' ').trim();
    
    // Split by period followed by space and capital letter, or by period at end
    const sentences = normalized.split(/\.(?=\s+[A-ZĄČĘĖĮŠŲŪŽ]|$)/).map(s => s.trim() + '.').filter(s => s.length > 1);
    
    return sentences;
}

export const BUP_CURRICULUM: BUPGrade[] = [
    // ===== GRADE 7 =====
    {
        grade: 7,
        modules: [
            {
                id: 'g7-m1',
                name: 'Skaičiai ir skaičiavimai',
                units: [
                    {
                        id: 'g7-m1-u1',
                        name: 'Realieji skaičiai',
                        subunits: [
                            {
                                id: 'g7-m1-u1-s1',
                                name: 'Laipsnis su sveikuoju rodikliu',
                                originalText: 'Apibrėžiamas laipsnis su natūraliuoju rodikliu. Pagrindžiami ir taikomi laipsnių su vienodais pagrindais ir laipsnių su skirtingais pagrindais, bet tokiais pačiais rodikliais daugybos ir dalybos, taip pat laipsnio kėlimo laipsniu veiksmai. Apibrėžiama laipsnio su nuliniu ir sveikuoju neigiamuoju rodikliu sąvoka. Pagrindžiama, kad laipsniams su sveikaisiais neigiamaisiais rodikliais būdingos tos pačios savybės kaip ir laipsniams su sveikaisiais teigiamaisiais rodikliais. Paaiškinama, kad a0=1, kai a nelygu 0. Aptariama veiksmų atlikimo tvarka reiškinyje, kai jame yra ir laipsnių. Nagrinėjamos realaus pasaulio situacijos, kai skaičiai užrašyti standartine skaičiaus išraiška a⋅10k, kai 1≤a<10; k yra sveikasis skaičius. Mokoma(si) skaičius užrašyti tokiu pavidalu, juos perskaityti, palyginti.',
                                sentences: splitIntoSentences('Apibrėžiamas laipsnis su natūraliuoju rodikliu. Pagrindžiami ir taikomi laipsnių su vienodais pagrindais ir laipsnių su skirtingais pagrindais, bet tokiais pačiais rodikliais daugybos ir dalybos, taip pat laipsnio kėlimo laipsniu veiksmai. Apibrėžiama laipsnio su nuliniu ir sveikuoju neigiamuoju rodikliu sąvoka. Pagrindžiama, kad laipsniams su sveikaisiais neigiamaisiais rodikliais būdingos tos pačios savybės kaip ir laipsniams su sveikaisiais teigiamaisiais rodikliais. Paaiškinama, kad a0=1, kai a nelygu 0. Aptariama veiksmų atlikimo tvarka reiškinyje, kai jame yra ir laipsnių. Nagrinėjamos realaus pasaulio situacijos, kai skaičiai užrašyti standartine skaičiaus išraiška a⋅10k, kai 1≤a<10; k yra sveikasis skaičius. Mokoma(si) skaičius užrašyti tokiu pavidalu, juos perskaityti, palyginti.')
                            }
                        ]
                    },
                    {
                        id: 'g7-m1-u2',
                        name: 'Finansiniai skaičiavimai',
                        subunits: [
                            {
                                id: 'g7-m1-u2-s1',
                                name: 'Finansiniai skaičiavimai',
                                originalText: 'Mokoma(si) spręsti uždavinius, kai skaičius ar dydis kelis kartus tam tikru procentų skaičiumi padidinamas arba sumažinamas. Aptariami moksliniai informacijos šaltiniai, kurie gali padėti planuoti ir pasiekti finansinį tikslą. Mokoma(si) sukurti, sekti ir koreguoti biudžetą, siekiant ilgalaikių finansinių tikslų pagal įvairius scenarijus (pavyzdžiui, mokiniai gali parengti ir apsvarstyti kelis kelionės, renginio, remonto ir pan. biudžeto pasiūlymus). Nagrinėjant bankų ir kitų finansinių institucijų konkrečius siūlymus, aptariama, kas yra palūkanos, palūkanų norma, mokoma(si) jas apskaičiuoti. Mokoma(si) paaiškinti, kaip palūkanų normos gali turėti įtakos taupymui, investicijoms ir galutinei skolinimosi kainai. Nagrinėjami už prekes ir paslaugas apmokėtų sąskaitų pavyzdžiai, įvairių finansinių įstaigų siūlomos paskolų palūkanų normos ir taikomi papildomi mokesčiai; mokoma(si) priimti sprendimą dėl geriausio pasirinkimo varianto iš kelių siūlomų.',
                                sentences: splitIntoSentences('Mokoma(si) spręsti uždavinius, kai skaičius ar dydis kelis kartus tam tikru procentų skaičiumi padidinamas arba sumažinamas. Aptariami moksliniai informacijos šaltiniai, kurie gali padėti planuoti ir pasiekti finansinį tikslą. Mokoma(si) sukurti, sekti ir koreguoti biudžetą, siekiant ilgalaikių finansinių tikslų pagal įvairius scenarijus (pavyzdžiui, mokiniai gali parengti ir apsvarstyti kelis kelionės, renginio, remonto ir pan. biudžeto pasiūlymus). Nagrinėjant bankų ir kitų finansinių institucijų konkrečius siūlymus, aptariama, kas yra palūkanos, palūkanų norma, mokoma(si) jas apskaičiuoti. Mokoma(si) paaiškinti, kaip palūkanų normos gali turėti įtakos taupymui, investicijoms ir galutinei skolinimosi kainai. Nagrinėjami už prekes ir paslaugas apmokėtų sąskaitų pavyzdžiai, įvairių finansinių įstaigų siūlomos paskolų palūkanų normos ir taikomi papildomi mokesčiai; mokoma(si) priimti sprendimą dėl geriausio pasirinkimo varianto iš kelių siūlomų.')
                            }
                        ]
                    }
                ]
            },
            {
                id: 'g7-m2',
                name: 'Modeliai ir sąryšiai',
                units: [
                    {
                        id: 'g7-m2-u1',
                        name: 'Algebra',
                        subunits: [
                            {
                                id: 'g7-m2-u1-s1',
                                name: 'Nelygybės',
                                originalText: 'Įsitikinama, kad skaitinėms nelygybėms būdingos savybės: jeigu a>b ir b>c, tai a>c; jeigu a>b, tai b<a; jeigu a>b, tai –a<–b; jeigu a>b, tai a±c>b±c; jeigu a>b ir c>0, tai a⋅c>b⋅c; jeigu a>b ir c<0, tai a⋅c<b⋅c; jeigu a>b ir c>0, tai a:c>b:c; jeigu a>b ir c<0, tai a:c<b:c. Apibrėžiamos sąvokos: nelygybė su vienu nežinomuoju, nelygybės sprendinys, nelygybės sprendinių aibė, griežta nelygybė, negriežta nelygybė; išsiaiškinama ženklų ≤,≥ prasmė. Aptariama, ką reiškia nelygybių sistema, dviguboji nelygybė; mokoma(si) ją užrašyti dviejų nelygybių sistema. Nelygybių su vienu nežinomuoju sprendimo algoritmas pagrindžiamas skaitinių nelygybių savybių taikymu. Praktikuojamasi spręsti dvigubąsias nelygybes, jų sistemas. Atkreipiamas dėmesys į nelygybės ar nelygybių sistemos sprendimo algoritmą; mokoma(si) taisyklingai užrašyti nelygybės ar nelygybių sistemos sprendimą, pavaizduoti gautus sprendinius skaičių tiesėje, užrašyti juos intervalu. Sprendžiami uždaviniai, kai prašoma atrinkti tam tikras sąlygas tenkinančius nelygybių sprendinius.',
                                sentences: splitIntoSentences('Įsitikinama, kad skaitinėms nelygybėms būdingos savybės: jeigu a>b ir b>c, tai a>c; jeigu a>b, tai b<a; jeigu a>b, tai –a<–b; jeigu a>b, tai a±c>b±c; jeigu a>b ir c>0, tai a⋅c>b⋅c; jeigu a>b ir c<0, tai a⋅c<b⋅c; jeigu a>b ir c>0, tai a:c>b:c; jeigu a>b ir c<0, tai a:c<b:c. Apibrėžiamos sąvokos: nelygybė su vienu nežinomuoju, nelygybės sprendinys, nelygybės sprendinių aibė, griežta nelygybė, negriežta nelygybė; išsiaiškinama ženklų ≤,≥ prasmė. Aptariama, ką reiškia nelygybių sistema, dviguboji nelygybė; mokoma(si) ją užrašyti dviejų nelygybių sistema. Nelygybių su vienu nežinomuoju sprendimo algoritmas pagrindžiamas skaitinių nelygybių savybių taikymu. Praktikuojamasi spręsti dvigubąsias nelygybes, jų sistemas. Atkreipiamas dėmesys į nelygybės ar nelygybių sistemos sprendimo algoritmą; mokoma(si) taisyklingai užrašyti nelygybės ar nelygybių sistemos sprendimą, pavaizduoti gautus sprendinius skaičių tiesėje, užrašyti juos intervalu. Sprendžiami uždaviniai, kai prašoma atrinkti tam tikras sąlygas tenkinančius nelygybių sprendinius.')
                            }
                        ]
                    },
                    {
                        id: 'g7-m2-u2',
                        name: 'Tiesiniai ir netiesiniai sąryšiai',
                        subunits: [
                            {
                                id: 'g7-m2-u2-s1',
                                name: 'Atvirkštinis proporcingumas',
                                originalText: 'Nagrinėjamos įvesties ir (ar) išvesties (I ir (ar) O) lentelės, kuriomis išreikštas atvirkštinio proporcingumo sąryšis; mokoma(si) tokias lenteles sudaryti ir susieti su uždavinio sąlyga (pavyzdžiui, greitis ir laikas, esant pastoviam keliui; stačiakampio ilgis ir plotis, esant pastoviam plotui ir pan.). Taip pat mokoma(si) tokių lentelių duomenis užrašyti skaičių poromis ir pažymėti taškais koordinačių plokštumoje. Formuojami grafiko skaitymo ir braižymo įgūdžiai. Sprendžiami įvairaus konteksto uždaviniai, kuriuose remiamasi samprata apie tiesioginį ir atvirkštinį proporcingumą.',
                                sentences: splitIntoSentences('Nagrinėjamos įvesties ir (ar) išvesties (I ir (ar) O) lentelės, kuriomis išreikštas atvirkštinio proporcingumo sąryšis; mokoma(si) tokias lenteles sudaryti ir susieti su uždavinio sąlyga (pavyzdžiui, greitis ir laikas, esant pastoviam keliui; stačiakampio ilgis ir plotis, esant pastoviam plotui ir pan.). Taip pat mokoma(si) tokių lentelių duomenis užrašyti skaičių poromis ir pažymėti taškais koordinačių plokštumoje. Formuojami grafiko skaitymo ir braižymo įgūdžiai. Sprendžiami įvairaus konteksto uždaviniai, kuriuose remiamasi samprata apie tiesioginį ir atvirkštinį proporcingumą.')
                            }
                        ]
                    }
                ]
            },
            {
                id: 'g7-m3',
                name: 'Geometrija ir matavimai',
                units: [
                    {
                        id: 'g7-m3-u1',
                        name: 'Konstravimas, transformacijos',
                        subunits: [
                            {
                                id: 'g7-m3-u1-s1',
                                name: 'Transformacijos',
                                originalText: 'Mokoma(si) pagrįsti koordinačių plokštumoje pavaizduotų figūrų lygumą, nurodant transformacijų seką, kaip iš vienos figūros buvo gauta kita. Taip pat mokoma(si) šią seką apibūdinti, nurodant pradinės ir gautos figūros koordinates (pavyzdžiui, (x;y), (x+2; y+2), ...).',
                                sentences: splitIntoSentences('Mokoma(si) pagrįsti koordinačių plokštumoje pavaizduotų figūrų lygumą, nurodant transformacijų seką, kaip iš vienos figūros buvo gauta kita. Taip pat mokoma(si) šią seką apibūdinti, nurodant pradinės ir gautos figūros koordinates (pavyzdžiui, (x;y), (x+2; y+2), ...).')
                            },
                            {
                                id: 'g7-m3-u1-s2',
                                name: 'Braižymas',
                                originalText: 'Fizinėmis ir skaitmeninėmis priemonėmis mokoma(si) rasti atkarpos vidurio tašką, nubrėžti duotai tiesei statmeną tiesę (kai ji eina per nurodytą tašką tiesėje ar šalia jos), padalyti kampą pusiau, pavaizduoti brėžinyje atstumą tarp dviejų taškų, tarp taško ir tiesės, tarp lygiagrečiųjų tiesių. Mokoma(si) brėžinyje atpažinti ar nubrėžti šiuos figūrų elementus: trikampio pusiaukampines, pusiaukraštines, aukštines; lygiagretainio aukštines; trapecijos aukštinę, pagrindus ir šonines kraštines.',
                                sentences: splitIntoSentences('Fizinėmis ir skaitmeninėmis priemonėmis mokoma(si) rasti atkarpos vidurio tašką, nubrėžti duotai tiesei statmeną tiesę (kai ji eina per nurodytą tašką tiesėje ar šalia jos), padalyti kampą pusiau, pavaizduoti brėžinyje atstumą tarp dviejų taškų, tarp taško ir tiesės, tarp lygiagrečiųjų tiesių. Mokoma(si) brėžinyje atpažinti ar nubrėžti šiuos figūrų elementus: trikampio pusiaukampines, pusiaukraštines, aukštines; lygiagretainio aukštines; trapecijos aukštinę, pagrindus ir šonines kraštines.')
                            }
                        ]
                    },
                    {
                        id: 'g7-m3-u2',
                        name: 'Figūros',
                        subunits: [
                            {
                                id: 'g7-m3-u2-s1',
                                name: 'Plokštumos figūros',
                                originalText: 'Nagrinėjant pavyzdžius, išsiaiškinama, kas yra vadinama apibrėžtimi, teorema, hipoteze, išvada. Nagrinėjami sąlyginių teiginių „jei, tai" pavyzdžiai, aiškinamasi, kuo teiginio sąlyga skiriasi nuo teiginio išvados. Mokoma(si) formuluoti sąlyginiam teiginiui atvirkštinį teiginį. Nagrinėjant konkrečius atvejus, įsitikinama, kad ne kiekvienas atvirkštinis teiginys yra teisingas. Apibrėžiama lygiagrečių tiesių sąvoka. Nagrinėjami kampai, kurie gaunami dvi lygiagrečias tieses perkirtus trečiąja tiese: atitinkamieji, vidaus priešiniai, vidaus vienašaliai. Aptariami lygiagrečiųjų tiesių požymiai, sprendžiami uždaviniai, susiję su tiesių lygiagretumu. Apibrėžiama, kokie keturkampiai vadinami kvadratais, stačiakampiais, lygiagretainiais, rombais, trapecijomis. Tyrinėjant konkrečius keturkampių pavyzdžius, pastebima, kad skirtingų tipų keturkampiai gali turėti bendrų ir tik jiems būdingų savybių. Aptariamos ir taikomos lygiagretainio, rombo, stačiakampio ir kvadrato savybės, kartu pastebint, kuri figūra yra bendresnės figūrų grupės dalis. Aiškinamasi, ką reiškia klasifikuoti figūras, prisimenamos trikampių rūšys (pagal kampus ir kraštines), klasifikuojami keturkampiai (pagal lygiagrečių kraštinių skaičių). Aptariamos trapecijų rūšys. Žinios apie nagrinėtas plokščiąsias figūras taikomos, sprendžiant paprastus matematinio ir realaus konteksto uždavinius.',
                                sentences: splitIntoSentences('Nagrinėjant pavyzdžius, išsiaiškinama, kas yra vadinama apibrėžtimi, teorema, hipoteze, išvada. Nagrinėjami sąlyginių teiginių „jei, tai" pavyzdžiai, aiškinamasi, kuo teiginio sąlyga skiriasi nuo teiginio išvados. Mokoma(si) formuluoti sąlyginiam teiginiui atvirkštinį teiginį. Nagrinėjant konkrečius atvejus, įsitikinama, kad ne kiekvienas atvirkštinis teiginys yra teisingas. Apibrėžiama lygiagrečių tiesių sąvoka. Nagrinėjami kampai, kurie gaunami dvi lygiagrečias tieses perkirtus trečiąja tiese: atitinkamieji, vidaus priešiniai, vidaus vienašaliai. Aptariami lygiagrečiųjų tiesių požymiai, sprendžiami uždaviniai, susiję su tiesių lygiagretumu. Apibrėžiama, kokie keturkampiai vadinami kvadratais, stačiakampiais, lygiagretainiais, rombais, trapecijomis. Tyrinėjant konkrečius keturkampių pavyzdžius, pastebima, kad skirtingų tipų keturkampiai gali turėti bendrų ir tik jiems būdingų savybių. Aptariamos ir taikomos lygiagretainio, rombo, stačiakampio ir kvadrato savybės, kartu pastebint, kuri figūra yra bendresnės figūrų grupės dalis. Aiškinamasi, ką reiškia klasifikuoti figūras, prisimenamos trikampių rūšys (pagal kampus ir kraštines), klasifikuojami keturkampiai (pagal lygiagrečių kraštinių skaičių). Aptariamos trapecijų rūšys. Žinios apie nagrinėtas plokščiąsias figūras taikomos, sprendžiant paprastus matematinio ir realaus konteksto uždavinius.')
                            },
                            {
                                id: 'g7-m3-u2-s2',
                                name: 'Erdvės figūros',
                                originalText: 'Nagrinėjant modelius ir brėžinius, mokoma(si) atpažinti stačiąją ar taisyklingąją prizmę, jos aukštinę; taisyklingąją piramidę, jos aukštinę ir apotemą; ritinio aukštinę; kūgio aukštinę ir sudaromąją.',
                                sentences: splitIntoSentences('Nagrinėjant modelius ir brėžinius, mokoma(si) atpažinti stačiąją ar taisyklingąją prizmę, jos aukštinę; taisyklingąją piramidę, jos aukštinę ir apotemą; ritinio aukštinę; kūgio aukštinę ir sudaromąją.')
                            },
                            {
                                id: 'g7-m3-u2-s3',
                                name: 'Ilgio, ploto, tūrio skaičiavimai',
                                originalText: 'Mokoma(si) apskaičiuoti trikampio, lygiagretainio, trapecijos plotą kaip stačiakampio ar kvadrato ploto dalį. Pagrindžiamos šių figūrų plotų formulės. Tyrinėjant nustatoma, kad apskritimo ilgio ir apskritimo skersmens ilgio santykis apytiksliai lygus 3,14 (įvedamas skaičius π). Aiškinama(si), kaip apskaičiuoti apskritimo ilgį, skritulio plotą, kai yra žinomas jo spindulio ilgis. Sprendžiami skritulio dalies ploto, apskritimo lanko dalies ilgio radimo uždaviniai, pavyzdžiui, ieškoma 1/4 skritulio ploto. Pagrindžiamos ritinio ir kūgio paviršiaus ploto apskaičiavimo formulės. Sprendžiami ritinio, kūgio paviršiaus ploto apskaičiavimo uždaviniai. Mokoma(si) paprastose situacijose taikyti stačiosios prizmės, ritinio, kūgio ir piramidės tūrio formules (šios formulės pateikiamos be įrodymų).',
                                sentences: splitIntoSentences('Mokoma(si) apskaičiuoti trikampio, lygiagretainio, trapecijos plotą kaip stačiakampio ar kvadrato ploto dalį. Pagrindžiamos šių figūrų plotų formulės. Tyrinėjant nustatoma, kad apskritimo ilgio ir apskritimo skersmens ilgio santykis apytiksliai lygus 3,14 (įvedamas skaičius π). Aiškinama(si), kaip apskaičiuoti apskritimo ilgį, skritulio plotą, kai yra žinomas jo spindulio ilgis. Sprendžiami skritulio dalies ploto, apskritimo lanko dalies ilgio radimo uždaviniai, pavyzdžiui, ieškoma 1/4 skritulio ploto. Pagrindžiamos ritinio ir kūgio paviršiaus ploto apskaičiavimo formulės. Sprendžiami ritinio, kūgio paviršiaus ploto apskaičiavimo uždaviniai. Mokoma(si) paprastose situacijose taikyti stačiosios prizmės, ritinio, kūgio ir piramidės tūrio formules (šios formulės pateikiamos be įrodymų).')
                            }
                        ]
                    }
                ]
            },
            {
                id: 'g7-m4',
                name: 'Duomenys ir tikimybės',
                units: [
                    {
                        id: 'g7-m4-u1',
                        name: 'Duomenys ir jų interpretavimas',
                        subunits: [
                            {
                                id: 'g7-m4-u1-s1',
                                name: 'Duomenys ir jų interpretavimas',
                                originalText: 'Aptariamos sąvokos: populiacija ir imtis, imties dydis, reprezentatyvioji imtis, atsitiktinumas. Paaiškinama, kas yra atsitiktinė imties elementų atranka, kaip galima organizuoti atsitiktinę imties elementų atranką (pavyzdžiui, pasinaudoti generatoriais). Susipažįstama su įvairiais imčių sudarymo būdais: sistemine atranka, sluoksnine atranka, lizdine atranka. Aiškinama(si) įvairių rūšių duomenų pobūdis, kaip praktikoje gali būti interpretuojamas duomenų rinkinių kintamumas. Nagrinėjant konkrečias situacijas, aptariami imčių sudarymo ir gautų išvadų apie jas pagrįstumo klausimai (pavyzdžiui, mokoma(si) nuspėti mokykloje vykstančių rinkimų nugalėtoją, remiantis atsitiktinės atrankos tyrimo duomenimis). Mokoma(si) duomenis pateikti skrituline diagrama ir spręsti uždavinius, kai duomenys pateikiami šios rūšies diagramomis.',
                                sentences: splitIntoSentences('Aptariamos sąvokos: populiacija ir imtis, imties dydis, reprezentatyvioji imtis, atsitiktinumas. Paaiškinama, kas yra atsitiktinė imties elementų atranka, kaip galima organizuoti atsitiktinę imties elementų atranką (pavyzdžiui, pasinaudoti generatoriais). Susipažįstama su įvairiais imčių sudarymo būdais: sistemine atranka, sluoksnine atranka, lizdine atranka. Aiškinama(si) įvairių rūšių duomenų pobūdis, kaip praktikoje gali būti interpretuojamas duomenų rinkinių kintamumas. Nagrinėjant konkrečias situacijas, aptariami imčių sudarymo ir gautų išvadų apie jas pagrįstumo klausimai (pavyzdžiui, mokoma(si) nuspėti mokykloje vykstančių rinkimų nugalėtoją, remiantis atsitiktinės atrankos tyrimo duomenimis). Mokoma(si) duomenis pateikti skrituline diagrama ir spręsti uždavinius, kai duomenys pateikiami šios rūšies diagramomis.')
                            }
                        ]
                    }
                ]
            }
        ]
    },
    // ===== GRADE 8 =====
    {
        grade: 8,
        modules: [
            {
                id: 'g8-m1',
                name: 'Skaičiai ir skaičiavimai',
                units: [
                    {
                        id: 'g8-m1-u1',
                        name: 'Realieji skaičiai',
                        subunits: [
                            {
                                id: 'g8-m1-u1-s1',
                                name: 'Kvadratinė ir kubinė šaknys',
                                originalText: 'Apibrėžiamos sąvokos: kvadratinė šaknis, kubinė šaknis. Mokoma(si) apskaičiuoti kvadratinių ir kubinių šaknų reikšmes, kai pošaknyje yra atitinkamų racionaliųjų skaičių kvadratai, kubai. Mokoma(si) rasti kvadratinės ir kubinės šaknies apytikslę reikšmę, įvertinti skaitinio reiškinio, kuriame yra kvadratinė arba kubinė šaknis, reikšmę. Sprendžiami uždaviniai, kai be skaičiuotuvo reikia įvertinti, tarp kokių sveikųjų skaičių yra nurodytoji šaknis (pavyzdžiui, rasti tokį sveikąjį skaičių a, su kuriuo teisinga nelygybė a≤√111<a+1). Praktikuojamasi įkelti teigiamą skaičių į pošaknį ir iškelti jį prieš šaknies ženklą, taip pat sudauginti to paties laipsnio šaknis ar jas padalyti.',
                                sentences: splitIntoSentences('Apibrėžiamos sąvokos: kvadratinė šaknis, kubinė šaknis. Mokoma(si) apskaičiuoti kvadratinių ir kubinių šaknų reikšmes, kai pošaknyje yra atitinkamų racionaliųjų skaičių kvadratai, kubai. Mokoma(si) rasti kvadratinės ir kubinės šaknies apytikslę reikšmę, įvertinti skaitinio reiškinio, kuriame yra kvadratinė arba kubinė šaknis, reikšmę. Sprendžiami uždaviniai, kai be skaičiuotuvo reikia įvertinti, tarp kokių sveikųjų skaičių yra nurodytoji šaknis (pavyzdžiui, rasti tokį sveikąjį skaičių a, su kuriuo teisinga nelygybė a≤√111<a+1). Praktikuojamasi įkelti teigiamą skaičių į pošaknį ir iškelti jį prieš šaknies ženklą, taip pat sudauginti to paties laipsnio šaknis ar jas padalyti.')
                            },
                            {
                                id: 'g8-m1-u1-s2',
                                name: 'Skaičių aibės',
                                originalText: 'Apibrėžiama, kokie skaičiai vadinami racionaliaisiais, iracionaliaisiais, realiaisiais. Aptariamos sąvokos: skaičių aibė, baigtinė aibė, begalinė aibė, aibės poaibis. Nustatomi ryšiai tarp skaičių aibių N,Z,Q,I,R. Mokoma(si) pagrįsti ir užrašyti, kuriai skaičių aibei priklauso ar nepriklauso įvairūs skaičiai (pavyzdžiui, 5∈N). Mokoma(si) skaičių aibes pavaizduoti simboliais, schemomis, užrašyti, naudojantis aibių teorijos simboliais, intervalais, nelygybėmis, reiškiniais (pavyzdžiui, mokoma(si) reiškiniu užrašyti lyginių, nelyginių natūraliųjų skaičių aibes).',
                                sentences: splitIntoSentences('Apibrėžiama, kokie skaičiai vadinami racionaliaisiais, iracionaliaisiais, realiaisiais. Aptariamos sąvokos: skaičių aibė, baigtinė aibė, begalinė aibė, aibės poaibis. Nustatomi ryšiai tarp skaičių aibių N,Z,Q,I,R. Mokoma(si) pagrįsti ir užrašyti, kuriai skaičių aibei priklauso ar nepriklauso įvairūs skaičiai (pavyzdžiui, 5∈N). Mokoma(si) skaičių aibes pavaizduoti simboliais, schemomis, užrašyti, naudojantis aibių teorijos simboliais, intervalais, nelygybėmis, reiškiniais (pavyzdžiui, mokoma(si) reiškiniu užrašyti lyginių, nelyginių natūraliųjų skaičių aibes).')
                            },
                            {
                                id: 'g8-m1-u1-s3',
                                name: 'Veiksmai su realiaisiais skaičiais',
                                originalText: 'Aptariama veiksmų su realiaisiais skaičiais atlikimo tvarka. Mokoma(si) apskaičiuoti, palyginti, įvertinti nesudėtingų skaitinių reiškinių reikšmes. Atliekant veiksmus su realiaisiais skaičiais, pirmenybė teikiama sklandžiam mintinio skaičiavimo strategijų taikymui. Kai skaičiai nėra patogūs skaičiuoti, pasitelkiamas skaičiuotuvas.',
                                sentences: splitIntoSentences('Aptariama veiksmų su realiaisiais skaičiais atlikimo tvarka. Mokoma(si) apskaičiuoti, palyginti, įvertinti nesudėtingų skaitinių reiškinių reikšmes. Atliekant veiksmus su realiaisiais skaičiais, pirmenybė teikiama sklandžiam mintinio skaičiavimo strategijų taikymui. Kai skaičiai nėra patogūs skaičiuoti, pasitelkiamas skaičiuotuvas.')
                            }
                        ]
                    },
                    {
                        id: 'g8-m1-u2',
                        name: 'Finansiniai skaičiavimai',
                        subunits: [
                            {
                                id: 'g8-m1-u2-s1',
                                name: 'Finansiniai skaičiavimai',
                                originalText: 'Mokoma(si) nustatyti ir palyginti valiutų kursus, konvertuoti valiutas, priimti sprendimą dėl mokėjimo būdo, kai galima pasirinkti, kokia valiuta atsiskaityti už prekes ar teikiamas paslaugas. Naudojantis skaitmeninėmis priemonėmis, tyrinėjami paprastų ir sudėtinių palūkanų augimo scenarijai ir aptariama, koks jų poveikis, planuojant ilgalaikį finansavimą (pavyzdžiui, sudaromas paskolos išsimokėjimo planas, taikant paprastuosius arba sudėtinius procentus; skaičiuojama, kokia būtų fiksuotos ir kintamosios palūkanų normos įtaka grąžintinai pinigų sumai). Aptariami galimybių gauti daugiau vertės už tuos pačius pinigus pavyzdžiai (pavyzdžiui, klientų lojalumas, dalyvavimas programose ir pan.). Mokoma(si) sukurti skaičiavimais grįsto geriausio pasirinkimo scenarijų, kuomet palyginamos palūkanų normos, metiniai mokesčiai, atlygiai ir kitos paskatos, kurias siūlo įvairios kredito ar lizingo bendrovės, bankai (pavyzdžiui, apskaičiuojami prekių įsigijimo, perkant kreditu ar lizingu, kainų skirtumai, aptariami kredito ir lizingo privalumai ir trūkumai).',
                                sentences: splitIntoSentences('Mokoma(si) nustatyti ir palyginti valiutų kursus, konvertuoti valiutas, priimti sprendimą dėl mokėjimo būdo, kai galima pasirinkti, kokia valiuta atsiskaityti už prekes ar teikiamas paslaugas. Naudojantis skaitmeninėmis priemonėmis, tyrinėjami paprastų ir sudėtinių palūkanų augimo scenarijai ir aptariama, koks jų poveikis, planuojant ilgalaikį finansavimą (pavyzdžiui, sudaromas paskolos išsimokėjimo planas, taikant paprastuosius arba sudėtinius procentus; skaičiuojama, kokia būtų fiksuotos ir kintamosios palūkanų normos įtaka grąžintinai pinigų sumai). Aptariami galimybių gauti daugiau vertės už tuos pačius pinigus pavyzdžiai (pavyzdžiui, klientų lojalumas, dalyvavimas programose ir pan.). Mokoma(si) sukurti skaičiavimais grįsto geriausio pasirinkimo scenarijų, kuomet palyginamos palūkanų normos, metiniai mokesčiai, atlygiai ir kitos paskatos, kurias siūlo įvairios kredito ar lizingo bendrovės, bankai (pavyzdžiui, apskaičiuojami prekių įsigijimo, perkant kreditu ar lizingu, kainų skirtumai, aptariami kredito ir lizingo privalumai ir trūkumai).')
                            }
                        ]
                    }
                ]
            },
            {
                id: 'g8-m2',
                name: 'Modeliai ir sąryšiai',
                units: [
                    {
                        id: 'g8-m2-u1',
                        name: 'Algebra',
                        subunits: [
                            {
                                id: 'g8-m2-u1-s1',
                                name: 'Raidiniai reiškiniai',
                                originalText: 'Apibrėžiamos vienanario, dvinario, trinario, daugianario sąvokos. Aiškinama(si), kaip sudauginti du raidinius reiškinius. Išvedamos ir taikomos greitosios daugybos formulės (kubų formulės nenagrinėjamos). Mokoma(si) paprastais atvejais iš kvadratinio trinario išskirti dvinario kvadratą. Daugianariai skaidomi dauginamaisiais (iškėlimas prieš skliaustus, greitosios daugybos formulių taikymas, grupavimas).',
                                sentences: splitIntoSentences('Apibrėžiamos vienanario, dvinario, trinario, daugianario sąvokos. Aiškinama(si), kaip sudauginti du raidinius reiškinius. Išvedamos ir taikomos greitosios daugybos formulės (kubų formulės nenagrinėjamos). Mokoma(si) paprastais atvejais iš kvadratinio trinario išskirti dvinario kvadratą. Daugianariai skaidomi dauginamaisiais (iškėlimas prieš skliaustus, greitosios daugybos formulių taikymas, grupavimas).')
                            },
                            {
                                id: 'g8-m2-u1-s2',
                                name: 'Lygčių sistemos',
                                originalText: 'Apibrėžiamos sąvokos: lygtis su dviem nežinomaisiais, lygties su dviem nežinomaisiais sprendinys (skaičių pora), praktikuojamasi vieną nežinomąjį išreikšti kitu. Mokoma(si) tiesinės lygties ax+by=c sprendinius pavaizduoti grafiškai (taikant ir skaitmenines priemones). Aptariamos sąvokos: tiesinių lygčių sistema, tiesinių lygčių sistemos sprendinys. Mokoma(si) spręsti tiesinių lygčių sistemas grafiniu, keitimo, sudėties, sulyginimo būdais, tyrinėjama, kiek sprendinių gali turėti tokia sistema. Nagrinėjamos įvairios realaus pasaulio situacijos, kurios gali būti modeliuojamos lygčių sistemomis.',
                                sentences: splitIntoSentences('Apibrėžiamos sąvokos: lygtis su dviem nežinomaisiais, lygties su dviem nežinomaisiais sprendinys (skaičių pora), praktikuojamasi vieną nežinomąjį išreikšti kitu. Mokoma(si) tiesinės lygties ax+by=c sprendinius pavaizduoti grafiškai (taikant ir skaitmenines priemones). Aptariamos sąvokos: tiesinių lygčių sistema, tiesinių lygčių sistemos sprendinys. Mokoma(si) spręsti tiesinių lygčių sistemas grafiniu, keitimo, sudėties, sulyginimo būdais, tyrinėjama, kiek sprendinių gali turėti tokia sistema. Nagrinėjamos įvairios realaus pasaulio situacijos, kurios gali būti modeliuojamos lygčių sistemomis.')
                            }
                        ]
                    },
                    {
                        id: 'g8-m2-u2',
                        name: 'Tiesiniai ir netiesiniai sąryšiai',
                        subunits: [
                            {
                                id: 'g8-m2-u2-s1',
                                name: 'Tiesinis sąryšis',
                                originalText: 'Nagrinėjamos įvesties ir (ar) išvesties (I ir (ar) O) lentelės, kuriomis išreikštas tiesinis sąryšis, mokoma(si) tokias lenteles sudaryti ir susieti su tekstinio uždavinio sąlyga (pavyzdžiui, kainos, kurią sudaro pastovioji ir kintamoji dalis, apskaičiavimas ir pan.). Tokių lentelių duomenys siejami su grafine jų išraiška, pastebint, kad skaičių poras atitinkantys taškai yra vienoje tiesėje. Sprendžiami įvairaus konteksto uždaviniai, kai dydžiai siejami tiesiniu sąryšiu.',
                                sentences: splitIntoSentences('Nagrinėjamos įvesties ir (ar) išvesties (I ir (ar) O) lentelės, kuriomis išreikštas tiesinis sąryšis, mokoma(si) tokias lenteles sudaryti ir susieti su tekstinio uždavinio sąlyga (pavyzdžiui, kainos, kurią sudaro pastovioji ir kintamoji dalis, apskaičiavimas ir pan.). Tokių lentelių duomenys siejami su grafine jų išraiška, pastebint, kad skaičių poras atitinkantys taškai yra vienoje tiesėje. Sprendžiami įvairaus konteksto uždaviniai, kai dydžiai siejami tiesiniu sąryšiu.')
                            }
                        ]
                    }
                ]
            },
            {
                id: 'g8-m3',
                name: 'Geometrija ir matavimai',
                units: [
                    {
                        id: 'g8-m3-u1',
                        name: 'Konstravimas, transformacijos',
                        subunits: [
                            {
                                id: 'g8-m3-u1-s1',
                                name: 'Transformacijos',
                                originalText: 'Apibrėžiama vektoriaus (kryptinės atkarpos) sąvoka. Mokoma(si) atpažinti lygius, priešinguosius vektorius, rasti vektorių sumą, skirtumą, padauginti vektorių iš skaičiaus. Šie apibrėžimai taikomi, sprendžiant paprastus geometrinius uždavinius (plačiau vektoriaus sąvoka taikoma fizikos pamokose).',
                                sentences: splitIntoSentences('Apibrėžiama vektoriaus (kryptinės atkarpos) sąvoka. Mokoma(si) atpažinti lygius, priešinguosius vektorius, rasti vektorių sumą, skirtumą, padauginti vektorių iš skaičiaus. Šie apibrėžimai taikomi, sprendžiant paprastus geometrinius uždavinius (plačiau vektoriaus sąvoka taikoma fizikos pamokose).')
                            },
                            {
                                id: 'g8-m3-u1-s2',
                                name: 'Braižymas',
                                originalText: 'Projektuojama, kaip atrodytų kuriamas objektas, žvelgiant į jį iš viršaus, iš priekio, iš šono. Projektuojamų objektų brėžiniai, numatomi jų vaizdai atliekami kompiuterinėmis programomis. Kuriant ar gaminant modelius, mokomasi naudotis brėžiniais, kuriuose nurodytas mastelis.',
                                sentences: splitIntoSentences('Projektuojama, kaip atrodytų kuriamas objektas, žvelgiant į jį iš viršaus, iš priekio, iš šono. Projektuojamų objektų brėžiniai, numatomi jų vaizdai atliekami kompiuterinėmis programomis. Kuriant ar gaminant modelius, mokomasi naudotis brėžiniais, kuriuose nurodytas mastelis.')
                            }
                        ]
                    },
                    {
                        id: 'g8-m3-u2',
                        name: 'Figūros',
                        subunits: [
                            {
                                id: 'g8-m3-u2-s1',
                                name: 'Plokštumos figūros',
                                originalText: 'Aiškinamasi, kuo matematinis įrodymas skiriasi nuo empirinių pastebėjimų. Pastebima, kad tą patį teiginį galima įrodyti keliais būdais. (Šioms idėjoms iliustruoti labai tinka Pitagoro teorema.) Paaiškinama, kuo tiesioginis įrodymas skiriasi nuo įrodymo prieštaros būdu (pavyzdžiui, prieštaros būdu įrodoma teorema apie taško atžvilgiu simetriškų tiesių lygiagretumą). Įrodomos Pitagoro ir jai atvirkštinė teoremos; mokoma(si) jas taikyti, sprendžiant įvairius uždavinius. Apibrėžiamos sąvokos: trikampio vidurio linija, trapecijos vidurio linija; pagrindžiamos jų savybės. Tyrinėjamos lygiašonio, lygiakraščio trikampio savybės, mokoma(si) jas pagrįsti. Įrodoma statinio priešais 30° kampą savybė. Mokoma(si) taikyti įgytas žinias, sprendžiant įvairius nesudėtingus uždavinius.',
                                sentences: splitIntoSentences('Aiškinamasi, kuo matematinis įrodymas skiriasi nuo empirinių pastebėjimų. Pastebima, kad tą patį teiginį galima įrodyti keliais būdais. (Šioms idėjoms iliustruoti labai tinka Pitagoro teorema.) Paaiškinama, kuo tiesioginis įrodymas skiriasi nuo įrodymo prieštaros būdu (pavyzdžiui, prieštaros būdu įrodoma teorema apie taško atžvilgiu simetriškų tiesių lygiagretumą). Įrodomos Pitagoro ir jai atvirkštinė teoremos; mokoma(si) jas taikyti, sprendžiant įvairius uždavinius. Apibrėžiamos sąvokos: trikampio vidurio linija, trapecijos vidurio linija; pagrindžiamos jų savybės. Tyrinėjamos lygiašonio, lygiakraščio trikampio savybės, mokoma(si) jas pagrįsti. Įrodoma statinio priešais 30° kampą savybė. Mokoma(si) taikyti įgytas žinias, sprendžiant įvairius nesudėtingus uždavinius.')
                            },
                            {
                                id: 'g8-m3-u2-s2',
                                name: 'Erdvės figūros',
                                originalText: 'Nagrinėjami pavyzdžiai, kaip Pitagoro teorema taikoma erdvinių figūrų elementams apskaičiuoti. Sprendžiami paprasti stačiosios prizmės, taisyklingosios piramidės, ritinio, kūgio, sferos paviršiaus ploto ir tūrio skaičiavimo uždaviniai. Naudojantis fizinėmis ir skaitmeninėmis priemonėmis, gaminami erdvinių figūrų modeliai, atliekami kūrybiniai darbai.',
                                sentences: splitIntoSentences('Nagrinėjami pavyzdžiai, kaip Pitagoro teorema taikoma erdvinių figūrų elementams apskaičiuoti. Sprendžiami paprasti stačiosios prizmės, taisyklingosios piramidės, ritinio, kūgio, sferos paviršiaus ploto ir tūrio skaičiavimo uždaviniai. Naudojantis fizinėmis ir skaitmeninėmis priemonėmis, gaminami erdvinių figūrų modeliai, atliekami kūrybiniai darbai.')
                            },
                            {
                                id: 'g8-m3-u2-s3',
                                name: 'Ilgio, ploto, tūrio skaičiavimai',
                                originalText: 'Sprendžiami įvairūs matematinio ir praktinio turinio uždaviniai, kai turimos figūrų pažinimo žinios derinamos su kitų sričių žiniomis (pavyzdžiui, Pitagoro teorema taikoma atstumui tarp dviejų taškų koordinačių plokštumoje apskaičiuoti).',
                                sentences: splitIntoSentences('Sprendžiami įvairūs matematinio ir praktinio turinio uždaviniai, kai turimos figūrų pažinimo žinios derinamos su kitų sričių žiniomis (pavyzdžiui, Pitagoro teorema taikoma atstumui tarp dviejų taškų koordinačių plokštumoje apskaičiuoti).')
                            }
                        ]
                    }
                ]
            },
            {
                id: 'g8-m4',
                name: 'Duomenys ir tikimybės',
                units: [
                    {
                        id: 'g8-m4-u1',
                        name: 'Duomenys ir jų interpretavimas',
                        subunits: [
                            {
                                id: 'g8-m4-u1-s1',
                                name: 'Duomenys ir jų interpretavimas',
                                originalText: 'Nagrinėjamos situacijos, kai keliami sudėtingesni statistiniai klausimai. Aiškinamasi, kaip surinkti duomenys grupuojami į vienodo ilgio intervalus. Nagrinėjant konkrečius pavyzdžius, aptariamos histogramos, empirinio tankio sąvokos. Mokoma(si) duomenis suskirstyti į vienodo ilgio intervalus, taip pat įvertinti, koks galėtų būti į intervalus patekusių duomenų vidurkis. Apibrėžiama kvartilio sąvoka. Mokoma(si) surasti duomenų pirmąjį, antrąjį, trečiąjį kvartilius, grafiškai pavaizduoti duomenų išsibarstymą stačiakampe diagrama (su „ūsais"), skaityti ir suprasti tokia diagrama pavaizduotą informaciją. Mokoma(si) interpretuoti duomenis, kai yra išskirčių (stipriai išsiskiriančių duomenų). Nagrinėjant praktines situacijas, aptariama, kaip apskaičiuojamas sukauptasis dažnis, sukauptasis santykinis dažnis. Aiškinamasi, kaip sukauptojo dažnio ir sukauptojo santykinio dažnio lentelės duomenys pavaizduojami sukauptojo dažnio ar sukauptojo santykinio dažnio diagrama, kaip skaityti ir interpretuoti tokiomis diagramomis pateiktus duomenis.',
                                sentences: splitIntoSentences('Nagrinėjamos situacijos, kai keliami sudėtingesni statistiniai klausimai. Aiškinamasi, kaip surinkti duomenys grupuojami į vienodo ilgio intervalus. Nagrinėjant konkrečius pavyzdžius, aptariamos histogramos, empirinio tankio sąvokos. Mokoma(si) duomenis suskirstyti į vienodo ilgio intervalus, taip pat įvertinti, koks galėtų būti į intervalus patekusių duomenų vidurkis. Apibrėžiama kvartilio sąvoka. Mokoma(si) surasti duomenų pirmąjį, antrąjį, trečiąjį kvartilius, grafiškai pavaizduoti duomenų išsibarstymą stačiakampe diagrama (su „ūsais"), skaityti ir suprasti tokia diagrama pavaizduotą informaciją. Mokoma(si) interpretuoti duomenis, kai yra išskirčių (stipriai išsiskiriančių duomenų). Nagrinėjant praktines situacijas, aptariama, kaip apskaičiuojamas sukauptasis dažnis, sukauptasis santykinis dažnis. Aiškinamasi, kaip sukauptojo dažnio ir sukauptojo santykinio dažnio lentelės duomenys pavaizduojami sukauptojo dažnio ar sukauptojo santykinio dažnio diagrama, kaip skaityti ir interpretuoti tokiomis diagramomis pateiktus duomenis.')
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

// Helper functions for easy access
export function getBUPByGrade(grade: number): BUPGrade | undefined {
    return BUP_CURRICULUM.find(g => g.grade === grade);
}

export function getBUPModule(moduleId: string): BUPModule | undefined {
    for (const grade of BUP_CURRICULUM) {
        const curriculumModule = grade.modules.find(m => m.id === moduleId);
        if (curriculumModule) return curriculumModule;
    }
    return undefined;
}

export function getBUPUnit(unitId: string): BUPUnit | undefined {
    for (const grade of BUP_CURRICULUM) {
        for (const curriculumModule of grade.modules) {
            const unit = curriculumModule.units.find(u => u.id === unitId);
            if (unit) return unit;
        }
    }
    return undefined;
}

export function getBUPSubunit(subunitId: string): BUPSubunit | undefined {
    for (const grade of BUP_CURRICULUM) {
        for (const curriculumModule of grade.modules) {
            for (const unit of curriculumModule.units) {
                const subunit = unit.subunits.find(s => s.id === subunitId);
                if (subunit) return subunit;
            }
        }
    }
    return undefined;
}

// Get all subunits for a specific grade (useful for dropdowns/selectors)
export function getAllSubunitsByGrade(grade: number): Array<{
    subunit: BUPSubunit;
    unitName: string;
    moduleName: string;
}> {
    const gradeData = getBUPByGrade(grade);
    if (!gradeData) return [];
    
    const result: Array<{subunit: BUPSubunit; unitName: string; moduleName: string}> = [];
    
    for (const curriculumModule of gradeData.modules) {
        for (const unit of curriculumModule.units) {
            for (const subunit of unit.subunits) {
                result.push({
                    subunit,
                    unitName: unit.name,
                    moduleName: curriculumModule.name
                });
            }
        }
    }
    
    return result;
}




