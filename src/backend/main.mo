import Text "mo:core/Text";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Int "mo:core/Int";

actor InvoiceDashboard {
  type InvoiceDocument = {
    id : Nat;
    title : Text;
    jsonData : Text;
    created : Time.Time;
  };

  module InvoiceDocument {
    public func compareByCreated(a : InvoiceDocument, b : InvoiceDocument) : Order.Order {
      Int.compare(a.created, b.created);
    };
  };

  let documents = Map.empty<Nat, InvoiceDocument>();

  var nextId = 0;

  public shared func saveDocument(title : Text, jsonData : Text) : async Nat {
    if (title.size() == 0) { Runtime.trap("Document title cannot be empty") };
    let id = nextId;
    let doc : InvoiceDocument = {
      id;
      title;
      jsonData;
      created = Time.now();
    };
    documents.add(id, doc);
    nextId += 1;
    id;
  };

  public query func getDocument(id : Nat) : async InvoiceDocument {
    switch (documents.get(id)) {
      case (null) { Runtime.trap("Document not found") };
      case (?doc) { doc };
    };
  };

  public shared func updateDocument(id : Nat, title : Text, jsonData : Text) : async () {
    switch (documents.get(id)) {
      case (null) { Runtime.trap("Document not found") };
      case (?existing) {
        documents.add(id, { existing with title; jsonData });
      };
    };
  };

  public shared func deleteDocument(id : Nat) : async () {
    if (not documents.containsKey(id)) { Runtime.trap("Document does not exist") };
    documents.remove(id);
  };

  public query func listDocuments() : async [InvoiceDocument] {
    documents.values().toArray().sort(InvoiceDocument.compareByCreated);
  };
};
