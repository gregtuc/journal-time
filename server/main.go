package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
)

type Journals struct {
	Journals []Journal `json:"journals,omitempty"`
}

type Journal struct {
	UUID string `json:"uuid,omitempty"`
	Title string `json:"title,omitempty"`
	DateTime string `json:"datetime,omitempty"`
	Body string `json:"body,omitempty"`
}

func handleSend(w http.ResponseWriter, r *http.Request) {
}

func handleReceive(w http.ResponseWriter, r *http.Request){
	body, _ := ioutil.ReadAll(r.Body)
	var journals Journals
	err := json.Unmarshal(body, &journals)
	if err != nil {
		panic(err)
	}
	
	fmt.Println(journals)
}

func handleRequests() {
	http.HandleFunc("/journals/send", handleSend);
	http.HandleFunc("/journals/receive", handleReceive);
	log.Fatal(http.ListenAndServe(":3000", nil))
}

func main() {
	handleRequests()
}