package main

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/big"
	"net/http"
	"time"

	"github.com/google/go-cmp/cmp"
	"github.com/gorilla/mux"
)

type JournalUploads struct {
	Code string `json:"code,omitempty"`
	Journals []JournalUpload `json:"journals,omitempty"`
}

type JournalUpload struct {
	UUID string `json:"uuid,omitempty"`
	Title string `json:"title,omitempty"`
	DateTime struct {
		Date string `json:"date,omitempty"`
		Time string `json:"time,omitempty"`
	}`json:"datetime,omitempty"`
	Body string `json:"body,omitempty"`
}

type SubmittedCode struct {
	Code string `json:"code,omitempty"`
}

type Connection struct {
	Code string `json:"code,omitempty"`
	Matched bool `json:"matched,omitempty"`
}

//Declaring my temporary cache
var codeCache []Connection;
var journalCache []JournalUploads

func main() {
	router := mux.NewRouter().StrictSlash(true)
    router.HandleFunc("/initializePairing", GetPairingCode)
	router.HandleFunc("/waitForMatch", WaitForMatch)
	router.HandleFunc("/submitCode", PostPairingCode)
	router.HandleFunc("/sendJournals", uploadAndReceiveJournals)

    log.Fatal(http.ListenAndServe(":8080", router))
}

func GetPairingCode(w http.ResponseWriter, r *http.Request) {
	generatedCode := sixDigits()
	response := Connection{
        Code: generatedCode,
		Matched: false,
    }

	codeCache = append(codeCache, response)

	if err := json.NewEncoder(w).Encode(response); err != nil {
        panic(err)
    }
}

func WaitForMatch(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
    if err != nil {
        panic(err)
    }
    var code SubmittedCode
    err = json.Unmarshal(body, &code)
    if err != nil {
        panic(err)
    }

	//Wait for verification code to be entered.
	for i := range codeCache {
		if(codeCache[i].Code == code.Code){
			for {
				if(codeCache[i].Matched){
					if err := json.NewEncoder(w).Encode(codeCache[i]); err != nil {
						panic(err)
					}
					goto Exit
				} else {
					time.Sleep(1 * time.Second)
				}
			}
		}
	}

	Exit:
	fmt.Println("Done waiting for match.")
}

func PostPairingCode(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
    if err != nil {
        panic(err)
    }
    var code SubmittedCode
    err = json.Unmarshal(body, &code)
    if err != nil {
        panic(err)
    }

	for i := range codeCache {
		if(codeCache[i].Code == code.Code){
			fmt.Println("Matching found.")
			codeCache[i].Matched = true
			if err := json.NewEncoder(w).Encode(codeCache[i]); err != nil {
				panic(err)
			}
			goto Exit
		}
	}
	Exit:
	fmt.Println("Done PostPairingCode.")
}

func uploadAndReceiveJournals(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
    if err != nil {
        panic(err)
    }
    var journals JournalUploads
    err = json.Unmarshal(body, &journals)
    if err != nil {
        panic(err)
    }
	fmt.Println(journals)

	//Use the journals variable to do whatever.
	journalCache = append(journalCache, journals)

	//Enter loop to wait for other party to have their stuff uploaded as well.
	for {
		for i := range journalCache {
			if((journalCache[i].Code == journals.Code) && !(cmp.Equal(journalCache[i].Journals,journals.Journals))){
				fmt.Println("Other parties journals were found.")
				if err := json.NewEncoder(w).Encode(journalCache[i].Journals); err != nil {
					panic(err)
				}
				goto Exit
			}
		}
	}
	Exit:
	fmt.Println("Done returning journals.")
}

func sixDigits() string {
	max := big.NewInt(999999)
	n, err := rand.Int(rand.Reader, max)
	if err != nil {
		log.Fatal(err)
	}

	//Quality control to ensure 6 digits are outputted.
	if (len(fmt.Sprint(n.Int64())) < 6){
		return sixDigits();
	} else {
		return fmt.Sprint(n.Int64())
	}	
}