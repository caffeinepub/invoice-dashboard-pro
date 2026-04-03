import Text "mo:core/Text";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Int "mo:core/Int";

actor {
  type AnimationProject = {
    name : Text;
    jsonData : Text;
    created : Time.Time;
  };

  module AnimationProject {
    public func compareByCreated(proj1 : AnimationProject, proj2 : AnimationProject) : Order.Order {
      Int.compare(proj1.created, proj2.created);
    };
  };

  let projects = Map.empty<Nat, AnimationProject>();

  var nextId = 0;

  public shared ({ caller }) func saveProject(name : Text, jsonData : Text) : async Nat {
    if (name.size() == 0) { Runtime.trap("Project name cannot be empty") };
    let newProject : AnimationProject = {
      name;
      jsonData;
      created = Time.now();
    };
    projects.add(nextId, newProject);
    let id = nextId;
    nextId += 1;
    id;
  };

  public query ({ caller }) func getProject(id : Nat) : async AnimationProject {
    switch (projects.get(id)) {
      case (null) { Runtime.trap("Project not found") };
      case (?p) { p };
    };
  };

  public shared ({ caller }) func deleteProject(id : Nat) : async () {
    if (not projects.containsKey(id)) { Runtime.trap("Project does not exist") };
    projects.remove(id);
  };

  public query ({ caller }) func listProjects() : async [AnimationProject] {
    projects.values().toArray().sort(AnimationProject.compareByCreated);
  };
};
