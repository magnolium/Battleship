﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;
using Microsoft.AspNetCore.SignalR;
using System.Text;
using System.Diagnostics;
using System.Net.Http;

namespace SignalR.Server.Hubs
{
    public class BattleHub : Hub
    {
        public MongoClient mClient = null;
        public MongoServer globalserver = null;
        public MongoDatabase dbMongoREAD = null;
        public MongoDatabase dbChartInfo = null;
        private static int accum = 0;

        public string PlayerSetup(string player)
        {
            return $"Player {player} is now setup";
        }

        public string AngularStart(string user)
        {
            Debug.WriteLine("ANGULARSTART: " + user);
            return ("{}");
        }

        public string LoadUserList(string data)
        {
            StringBuilder sx = new StringBuilder();
            sx.AppendFormat("{0}", data);
    
            BsonDocument bsdx = null;
            try
            {
                bsdx = MongoDB.Bson.Serialization.BsonSerializer.Deserialize<BsonDocument>(sx.ToString());
            }
            catch (Exception e)
            {
                Trace.WriteLine("GAMERS-LIST-POST-ERROR" + e.Message);
            }

            StringBuilder sb = new StringBuilder();
            sb.AppendFormat("{{}}");

            try
            {
                string userid = bsdx.GetElement("userid").Value.ToString();


                string s_serverip = "localhost:27017"; // System.Configuration.ConfigurationManager.AppSettings["battleship_server"];
                string s_Database = "battleship"; // System.Configuration.ConfigurationManager.AppSettings["battleship_db"];
                string s_collection = "gamers";

                sb.Clear();
                sb.AppendFormat("{{ \"game_id\" : {{$ne : \"{0}\"}} }}", userid);

                GetDB db = new GetDB(s_serverip, s_Database);
                db.GetSystemDatabase(s_Database, s_collection, ref dbMongoREAD, ref s_Database, ref s_collection);

                MongoCollection<BsonDocument> gamersDoc = dbMongoREAD.GetCollection<BsonDocument>("gamers");
                BsonDocument queryX = MongoDB.Bson.Serialization.BsonSerializer.Deserialize<BsonDocument>(sb.ToString());
                QueryDocument queryDoc = new QueryDocument(queryX);
                MongoCursor<BsonDocument> gamers = gamersDoc.Find(queryDoc);

                sb.Clear();
                if (gamers != null)
                {
                    sb.AppendFormat("{{\"data\" : {{\"gamers\": [");
                    int i = 0;

                    foreach (BsonDocument bsd in gamers)
                    {
                        bsd.RemoveAt(0);

                        if (i > 0)
                            sb.AppendFormat(",");

                        sb.AppendFormat("{0}", bsd.ToString());
                        i++;
                    }
                    sb.AppendFormat("]}} }}");
                }
                else
                    sb.AppendFormat("{{\"gamers\" : \"USERNOTFOUND\"}}");
            }
            catch (Exception ex)
            {
                sb.Clear();
                sb.AppendFormat("{{ \"INT_ERR_11\" : \"{0}\" }}", ex.Message);
                return sb.ToString(); 
            }

            string json = sb.ToString();

            return json;
        }

        public string RequestSubmit(string data)
        {
            BsonDocument bsd = null;
            try
            {
                bsd = MongoDB.Bson.Serialization.BsonSerializer.Deserialize<BsonDocument>(data);
            }
            catch (Exception ex)
            {
                StringBuilder sbq = new StringBuilder();
                sbq.AppendFormat("{{ \"INT_ERR_5\" : \"{0}\" }}", ex.Message);
                return sbq.ToString();
            }

            ///////////////////////////////////////////////////////
            // ASSIGN THE ATTRIBUTES
            ///////////////////////////////////////////////////////
            string game_id = bsd.GetElement("game_id").Value.ToString();
            string[] gamersid = game_id.Split('|');
            string idd_1 = gamersid[0] + "|" + gamersid[1];
            string idd_2 = gamersid[1] + "|" + gamersid[0];

            string action = bsd.GetElement("action").Value.ToString();
            string user_local = bsd.GetElement("local_user").Value.ToString();
            string user_remote = bsd.GetElement("remote_user").Value.ToString();
            int columns = (int)bsd.GetElement("columns").Value;
            int rows = (int)bsd.GetElement("rows").Value;
            BsonArray bsdShip = (BsonArray)bsd.GetElement("ships").Value;
            BsonArray bsdHits = (BsonArray)bsd.GetElement("hits").Value;

            StringBuilder sbx = new StringBuilder();
            sbx.AppendFormat("\"ships\": [");
            int i = 0;
            foreach (BsonDocument bsa in bsdShip)
            {
                if (i > 0)
                    sbx.AppendFormat(",");
                sbx.AppendFormat("{0}", bsa.ToString());
                i++;
            }
            sbx.AppendFormat("]");

            StringBuilder sbk = new StringBuilder();
            sbk.AppendFormat("\"hits\": [");
            int ii = 0;
            foreach (BsonDocument bsa in bsdHits)
            {
                if (ii > 0)
                    sbk.AppendFormat(",");
                sbk.AppendFormat("{0}", bsa.ToString());
                ii++;
            }
            sbk.AppendFormat("]");

            StringBuilder sb = new StringBuilder();

            try
            {
                string s_serverip = "localhost:27017"; // System.Configuration.ConfigurationManager.AppSettings["battleship_server"];
                string s_Database = "battleship"; // System.Configuration.ConfigurationManager.AppSettings["battleship_db"];
                string s_collection = "gamerboard";

                sb.AppendFormat("{{\"server\":\"{0}\", \"database\":\"{1}\",\"user_1\":\"{2}\",\"user_2\":\"{3}\",\"action\":\"{4}\" }}", s_serverip, s_Database, user_local, user_remote, action);

                GetDB db = new GetDB(s_serverip, s_Database);
                db.GetSystemDatabase(s_Database, s_collection, ref dbMongoREAD, ref s_Database, ref s_collection);

                MongoCollection<BsonDocument> gamers = dbMongoREAD.GetCollection<BsonDocument>("gamerboard");
                BsonDocument queryX = MongoDB.Bson.Serialization.BsonSerializer.Deserialize<BsonDocument>(sb.ToString());
                QueryDocument queryDoc = new QueryDocument(queryX);
                MongoCursor<BsonDocument> views = gamers.Find(queryDoc);

                if (views.Count() == 0)
                {
                    sb.Clear();
                    sb.AppendFormat("{{\"game_id\":\"{0}\", \"next_player\" : \"{1}\", \"user_1\":\"{2}\",\"user_2\":\"{3}\", \"issuer\": \"{4}\",\"action\":\"{5}\", {6}, {7},\"ships_remote\": [], \"hits_remote\": [], \"winner\":\"@@@@\"}}", idd_1, user_remote, user_local, user_remote, user_local, action, sbx.ToString(), sbk.ToString());
                    BsonDocument bsdx = MongoDB.Bson.Serialization.BsonSerializer.Deserialize<BsonDocument>(sb.ToString());
                    gamers.Insert(bsdx);
                }
            }
            catch (Exception ex)
            {
                sb.Clear();
                sb.AppendFormat("{{ \"INT_ERR_0\" : \"{0}\" }}", ex.Message);
                return (sb.ToString());
            }

            ///////////////////////////////////////////
            string json = sb.ToString();
            return json;
        }

        public string ValidateLogin(string data)
        {
            BsonDocument bsd = null;
            try
            {
                bsd = MongoDB.Bson.Serialization.BsonSerializer.Deserialize<BsonDocument>(data);
            }
            catch (Exception e)
            {
                Trace.WriteLine("VALIDATE-POST-ERROR" + e.Message);
            }

            ///////////////////////////////////////////////////////
            // ASSIGN THE ATTRIBUTES
            ///////////////////////////////////////////////////////
            string userid = bsd.GetElement("user").Value.ToString();
            string password = bsd.GetElement("password").Value.ToString();
            string login_type = bsd.GetElement("type").Value.ToString();

            StringBuilder sb = new StringBuilder();
            string s_serverip = "localhost:27017"; // System.Configuration.ConfigurationManager.AppSettings["battleship_server"];
            string s_Database = "battleship"; // System.Configuration.ConfigurationManager.AppSettings["battleship_db"];
            string s_collection = "gamers";

            sb.AppendFormat("{{\"game_id\":\"{0}\", \"game_pswd\":\"{1}\", \"type\":\"gamers\"}}", userid, password);

            GetDB db = new GetDB(s_serverip, s_Database);
            db.GetSystemDatabase(s_Database, s_collection, ref dbMongoREAD, ref s_Database, ref s_collection);

            MongoCollection<BsonDocument> gamersDoc = dbMongoREAD.GetCollection<BsonDocument>("gamers");
            BsonDocument queryX = MongoDB.Bson.Serialization.BsonSerializer.Deserialize<BsonDocument>(sb.ToString());
            QueryDocument queryDoc = new QueryDocument(queryX);
            MongoCursor<BsonDocument> gamers = gamersDoc.Find(queryDoc);

            string json = "{\"validation\":\"" + userid + "\",\"type\":\"" + login_type + "\", \"response\":\"OK\"}";

            if (gamers.Count() > 0) //You are in the system
            {
                if (login_type == "NEW")    //You are new but using an existing name
                    json = "{\"validation\":\"" + userid + "\",\"type\":\"" + login_type + "\",\"response\":\"USEREXISTS\"}";
                else
                    json = "{\"validation\":\"" + userid + "\",\"type\":\"" + login_type + "\",\"response\":\"PRESENT\"}";
            }
            else // No record of you
            {
                //check if username exists
                sb.Clear();
                sb.AppendFormat("{{\"game_id\":\"{0}\",\"type\":\"gamers\"}}", userid);
                queryX = MongoDB.Bson.Serialization.BsonSerializer.Deserialize<BsonDocument>(sb.ToString());
                queryDoc = new QueryDocument(queryX);
                MongoCursor<BsonDocument> users = gamersDoc.Find(queryDoc);
                if (users.Count() > 0)  //Your name is in the system but your password isn't
                {
                    if (login_type == "NEW") // You are a new user trying aname that exists
                        json = "{\"validation\":\"" + userid + "\",\"type\":\"" + login_type + "\",\"response\":\"USEREXISTS\"}";
                    else // You are a user with a wrong password
                        json = "{\"validation\":\"" + userid + "\",\"type\":\"" + login_type + "\",\"response\":\"PSWDFAIL\"}";
                }
                else //You are not in the system so will be added
                {
                    json = "{\"game_id\":\"" + userid + "\",\"game_pswd\":\"" + password + "\",\"type\":\"gamers\"}";
                    BsonDocument bsdx = MongoDB.Bson.Serialization.BsonSerializer.Deserialize<BsonDocument>(json);
                    gamersDoc.Insert(bsdx);
                    json = "{\"validation\":\"" + userid + "\",\"type\":\"" + login_type + "\",\"response\":\"OK\"}";
                }
            }

            return json;
        }

        public string StartGame(string data)
        {
            string json = "[{\"Battleship\":\"StartGame\"}]";

            BsonDocument bsd = null;
            try
            {
                bsd = MongoDB.Bson.Serialization.BsonSerializer.Deserialize<BsonDocument>(data);
            }
            catch (Exception e)
            {
                Trace.WriteLine("SUBMIT-POST-ERROR" + e.Message);
            }

            StringBuilder sb = new StringBuilder();

            try
            {
                ///////////////////////////////////////////////////////
                // ASSIGN THE ATTRIBUTES
                ///////////////////////////////////////////////////////
                string user_1 = bsd.GetElement("user1").Value.ToString();
                string user_2 = bsd.GetElement("user2").Value.ToString();

                string s_serverip = "localhost:27017"; // System.Configuration.ConfigurationManager.AppSettings["battleship_server"];
                string s_Database = "battleship"; // System.Configuration.ConfigurationManager.AppSettings["battleship_db"];
                string s_collection = "gamerboard";

                sb.AppendFormat("{{ \"game_id\" : \"{0}|{1}\", \"action\" : \"REQ\" }}", user_1, user_2);

                GetDB db = new GetDB(s_serverip, s_Database);
                db.GetSystemDatabase(s_Database, s_collection, ref dbMongoREAD, ref s_Database, ref s_collection);

                MongoCollection<BsonDocument> gamersDoc = dbMongoREAD.GetCollection<BsonDocument>(s_collection);
                BsonDocument queryX = MongoDB.Bson.Serialization.BsonSerializer.Deserialize<BsonDocument>(sb.ToString());
                QueryDocument queryDoc = new QueryDocument(queryX);

                StringBuilder sbQueryX = new StringBuilder();
                sbQueryX.AppendFormat("{{ $set: {{ action : \"PLAY\", \"next_player\" : \"{0}\" }} }}", user_2);

                MongoUpdateOptions muo = new MongoUpdateOptions();
                muo.Flags = UpdateFlags.Multi;
                BsonDocument queryx = MongoDB.Bson.Serialization.BsonSerializer.Deserialize<BsonDocument>(sbQueryX.ToString());
                UpdateDocument updateDoc = new UpdateDocument(queryx);
                gamersDoc.Update(queryDoc, updateDoc, muo);

                json = bsd.ToString();
            }
            catch (Exception ex)
            {
                sb.Clear();
                sb.AppendFormat("{{ \"INT_ERR_4\" : \"{0}\" }}", ex.Message);
                return sb.ToString();
            }
            return json;
        }

        public string PostApiAction(string data)
        {
            BsonDocument bsd = null;
            try
            {
                bsd = MongoDB.Bson.Serialization.BsonSerializer.Deserialize<BsonDocument>(data);
            }
            catch (Exception ex)
            {
                StringBuilder sbx = new StringBuilder();
                sbx.AppendFormat("{{ \"INT_ERR_0\" : \"{0}\" }}", ex.Message);
                return sbx.ToString();
            }
            ///////////////////////////////////////////////////////
            // ASSIGN THE ATTRIBUTES
            ///////////////////////////////////////////////////////
            string user_1 = bsd.GetElement("user1").Value.ToString();
            string user_2 = bsd.GetElement("user2").Value.ToString();
            string command = bsd.GetElement("command").Value.ToString();


            // CONNECTION ///////////////////////////////////////////////////////////////////////////////////////////////////
            string s_serverip = "localhost:27017"; // System.Configuration.ConfigurationManager.AppSettings["battleship_server"];
            string s_Database = "battleship"; // System.Configuration.ConfigurationManager.AppSettings["battleship_db"];
            string s_collection = "gamerboard";
            GetDB db = new GetDB(s_serverip, s_Database);
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            StringBuilder sb = new StringBuilder();
            StringBuilder json = new StringBuilder();

            sb.AppendFormat("{{}}");
            json.AppendFormat("{{ \"action\" : \"{0}\", \"user_1\" : \"{1}\", \"user_2\" : \"{2}\" }}", command, user_1, user_2);


            db.GetSystemDatabase(s_Database, s_collection, ref dbMongoREAD, ref s_Database, ref s_collection);

            if (command == "ISPLAYING")
            {
                sb.Clear();
                sb.AppendFormat("{{ $or: [{{ \"game_id\" : \"{0}|{1}\", \"action\" : \"WAIT\" }}, {{ \"game_id\" : \"{0}|{1}\", \"action\" : \"PLAY\" }}, {{ \"game_id\" : \"{1}|{0}\", \"action\" : \"WAIT\" }}, {{ \"game_id\" : \"{1}|{0}\", \"action\" : \"PLAY\" }} ] }}", user_1, user_2);

                try
                {
                    MongoCollection<BsonDocument> gamersDoc = dbMongoREAD.GetCollection<BsonDocument>(s_collection);
                    BsonDocument queryX = MongoDB.Bson.Serialization.BsonSerializer.Deserialize<BsonDocument>(sb.ToString());
                    QueryDocument queryDoc = new QueryDocument(queryX);
                    MongoCursor<BsonDocument> datax = gamersDoc.Find(queryDoc);

                    if (datax != null)
                    {
                        List<BsonDocument> bsdShip = datax.ToList();

                        StringBuilder sbx = new StringBuilder();
                        if (bsdShip.Count() > 0)
                            sbx.AppendFormat("\"details\": ");
                        int i = 0;
                        foreach (BsonDocument bsa in bsdShip)
                        {
                            bsa.RemoveAt(0);
                            if (i > 0)
                                sbx.AppendFormat(",");
                            sbx.AppendFormat("{0}", bsa.ToString());
                            i++;
                        }

                        json.Clear();
                        if (datax.Count() == 0)
                            json.AppendFormat("{{ \"action\" : \"{0}\", \"response\" : \"NO\"}}", command);
                        else
                            json.AppendFormat("{{ \"action\" : \"{0}\", \"response\" : \"YES\", {1}  }}", command, sbx.ToString());
                    }
                }
                catch (Exception ex)
                {
                    sb.Clear();
                    sb.AppendFormat("{{ \"INT_ERR_1\" : \"{0}\" }}", ex.Message);
                    return sb.ToString();
                }
            }

            if (command == "UPDATEGAMEBOARD")
            {
                sb.Clear();
                sb.AppendFormat("{{ $or: [{{\"game_id\" : \"{0}|{1}\", \"action\" : \"PLAY\" }}, {{\"game_id\" : \"{1}|{0}\", \"action\" : \"PLAY\" }} ] }}", user_1, user_2);
                try
                {
                    MongoCollection<BsonDocument> gamersDoc = dbMongoREAD.GetCollection<BsonDocument>(s_collection);
                    BsonDocument queryX = MongoDB.Bson.Serialization.BsonSerializer.Deserialize<BsonDocument>(sb.ToString());
                    QueryDocument queryDoc = new QueryDocument(queryX);
                    MongoCursor<BsonDocument> game = gamersDoc.Find(queryDoc);
                    List<BsonDocument> v_game = game.ToList();

                    BsonArray ships = (BsonArray)bsd.GetElement("ships").Value;
                    BsonArray hits = (BsonArray)bsd.GetElement("hits").Value;

                    string issuer = v_game[0].GetElement("issuer").Value.ToString();

                    StringBuilder sbQueryX = new StringBuilder();

                    if (user_1 == issuer)
                        sbQueryX.AppendFormat("{{ $set: {{ ships : {0},  hits : {1} }} }}", ships, hits);
                    else
                        sbQueryX.AppendFormat("{{ $set: {{ ships_remote : {0},  hits_remote : {1} }} }}", ships, hits);

                    MongoUpdateOptions muo = new MongoUpdateOptions();
                    muo.Flags = UpdateFlags.Multi;
                    BsonDocument queryx = MongoDB.Bson.Serialization.BsonSerializer.Deserialize<BsonDocument>(sbQueryX.ToString());
                    UpdateDocument updateDoc = new UpdateDocument(queryx);
                    gamersDoc.Update(queryDoc, updateDoc, muo);
                    game = gamersDoc.Find(queryDoc);
                    v_game = game.ToList();
                    v_game[0].RemoveAt(0);
                    return v_game[0].ToString();
                }
                catch (Exception ex)
                {
                    sb.Clear();
                    sb.AppendFormat("{{ \"INT_ERR_2\" : \"{0}\" }}", ex.Message);
                    return sb.ToString();
                }

            }

            if (command == "FETCHGAMEBOARD")
            {
                try
                {
                    sb.Clear();
                    sb.AppendFormat("{{ $or: [{{ \"game_id\" : \"{0}|{1}\", \"action\" : \"WAIT\" }}, {{ \"game_id\" : \"{0}|{1}\", \"action\" : \"PLAY\" }}, {{ \"game_id\" : \"{1}|{0}\", \"action\" : \"WAIT\" }}, {{ \"game_id\" : \"{1}|{0}\", \"action\" : \"PLAY\" }}] }}", user_1, user_2);
                    MongoCollection<BsonDocument> gamersDoc = dbMongoREAD.GetCollection<BsonDocument>(s_collection);
                    BsonDocument queryX = MongoDB.Bson.Serialization.BsonSerializer.Deserialize<BsonDocument>(sb.ToString());
                    QueryDocument queryDoc = new QueryDocument(queryX);
                    MongoCursor<BsonDocument> datax = gamersDoc.Find(queryDoc);

                    if (datax != null)
                    {
                        List<BsonDocument> gameboard = datax.ToList();
                        if (gameboard.Count() > 0)
                        {
                            gameboard[0].RemoveAt(0);

                            //Add the action element to the bson
                            BsonElement bse = new BsonElement("action", (BsonValue)"FETCHGAMEBOARD");
                            gameboard[0].Add(bse);
                            return gameboard[0].ToString();
                        }
                        else
                        {   //Handles the local who made request selecting a remote
                            sb.Clear();
                            sb.AppendFormat("{{ $or: [{{ \"game_id\" : \"{0}|{1}\", \"action\" : \"REQ\" }}, {{ \"game_id\" : \"{1}|{0}\", \"action\" : \"REQ\" }}] }}", user_1, user_2);
                            gamersDoc = dbMongoREAD.GetCollection<BsonDocument>(s_collection);
                            queryX = MongoDB.Bson.Serialization.BsonSerializer.Deserialize<BsonDocument>(sb.ToString());
                            queryDoc = new QueryDocument(queryX);
                            datax = gamersDoc.Find(queryDoc);

                            if (datax != null)
                            {
                                gameboard = datax.ToList();
                                if (gameboard.Count() > 0)
                                {
                                    gameboard[0].RemoveAt(0);
                                    BsonElement bse = new BsonElement("action", (BsonValue)"FETCHGAMEBOARD");
                                    gameboard[0].Add(bse);
                                    return gameboard[0].ToString();
                                }
                            }

                        }
                    }
                }
                catch (Exception ex)
                {
                    sb.Clear();
                    sb.AppendFormat("{{ \"INT_ERR_3\" : \"{0}\" }}", ex.Message);
                    return sb.ToString();
                }
            }

            if (command == "GETREMOTEGAMEBOARD")
            {
                try
                {
                    sb.Clear();
                    sb.AppendFormat("{{ $or: [{{ \"game_id\" : \"{0}|{1}\", \"action\" : \"WAIT\" }}, {{ \"game_id\" : \"{0}|{1}\", \"action\" : \"PLAY\" }}, {{ \"game_id\" : \"{1}|{0}\", \"action\" : \"WAIT\" }}, {{ \"game_id\" : \"{1}|{0}\", \"action\" : \"PLAY\" }}] }}", user_2, user_1);
                    MongoCollection<BsonDocument> gamersDoc = dbMongoREAD.GetCollection<BsonDocument>(s_collection);
                    BsonDocument queryX = MongoDB.Bson.Serialization.BsonSerializer.Deserialize<BsonDocument>(sb.ToString());
                    QueryDocument queryDoc = new QueryDocument(queryX);
                    MongoCursor<BsonDocument> datax = gamersDoc.Find(queryDoc);

                    if (datax != null)
                    {
                        List<BsonDocument> gameboard = datax.ToList();
                        if (gameboard.Count() > 0)
                        {
                            gameboard[0].RemoveAt(0);

                            //Add the action element to the bson
                            BsonElement bse = new BsonElement("command", (BsonValue)"GETREMOTEGAMEBOARD");
                            gameboard[0].Add(bse);

                            return gameboard[0].ToString();
                        }
                    }
                }
                catch (Exception ex)
                {
                    sb.Clear();
                    sb.AppendFormat("{{ \"INT_ERR_6\" : \"{0}\" }}", ex.Message);
                    return sb.ToString();
                }

            }

            if (command == "ENDGAME")
            {
                try
                {
                    sb.Clear();
                    sb.AppendFormat("{{ $or : [ {{\"game_id\":\"{0}|{1}\"}}, {{\"game_id\":\"{1}|{0}\"}} ] }}", user_1, user_2);
                    MongoCollection<BsonDocument> gamersDoc = dbMongoREAD.GetCollection<BsonDocument>(s_collection);
                    BsonDocument queryX = MongoDB.Bson.Serialization.BsonSerializer.Deserialize<BsonDocument>(sb.ToString());
                    QueryDocument queryDoc = new QueryDocument(queryX);
                    gamersDoc.Remove(queryDoc);
                }
                catch (Exception ex)
                {
                    sb.Clear();
                    sb.AppendFormat("{{ \"INT_ERR_8\" : \"{0}\" }}", ex.Message);
                    return sb.ToString();
                }
            }
            return json.ToString();
        }

        public string UpdateHitList(string data)
        {
            BsonDocument bsd = null;
            try
            {
                bsd = MongoDB.Bson.Serialization.BsonSerializer.Deserialize<BsonDocument>(data);
            }
            catch (Exception e)
            {
                Trace.WriteLine("STATUS-POST-ERROR" + e.Message);
            }

            StringBuilder sb = new StringBuilder();

            try
            {
                ///////////////////////////////////////////////////////
                // ASSIGN THE ATTRIBUTES
                ///////////////////////////////////////////////////////
                string user_1 = bsd.GetElement("user1").Value.ToString();
                string user_2 = bsd.GetElement("user2").Value.ToString();
                string command = bsd.GetElement("command").Value.ToString();

                string s_serverip = "localhost:27017"; // System.Configuration.ConfigurationManager.AppSettings["battleship_server"];
                string s_Database = "battleship"; // System.Configuration.ConfigurationManager.AppSettings["battleship_db"];
                string s_collection = "gamerboard";

                sb.AppendFormat("{{ $or : [ {{\"game_id\":\"{0}|{1}\"}}, {{\"game_id\":\"{1}|{0}\"}} ] }}", user_1, user_2);

                GetDB db = new GetDB(s_serverip, s_Database);
                db.GetSystemDatabase(s_Database, s_collection, ref dbMongoREAD, ref s_Database, ref s_collection);

                MongoCollection<BsonDocument> gamersDoc = dbMongoREAD.GetCollection<BsonDocument>(s_collection);
                BsonDocument queryX = MongoDB.Bson.Serialization.BsonSerializer.Deserialize<BsonDocument>(sb.ToString());
                QueryDocument queryDoc = new QueryDocument(queryX);
                MongoCursor<BsonDocument> gamers = gamersDoc.Find(queryDoc);
                List<BsonDocument> game = gamers.ToList();

                //Retrieve your hitlist
                BsonArray bsa = null;
                if (game[0].GetElement("issuer").Value.ToString() == user_1)    //ISSUER
                {
                    bsa = (BsonArray)game[0].GetElement("hits_remote").Value;
                    string cell = bsd.GetElement("cell").Value.ToString();
                    //string evt = bsd.GetElement("event").Value.ToString();

                    BsonDocument newBSD = new BsonDocument
                    {
                        {"cell" , cell},
                        {"hit" , "evt"}
                    };

                    bsa.Add(newBSD);
                }
                else
                {
                    bsa = (BsonArray)game[0].GetElement("hits").Value;
                    string cell = bsd.GetElement("cell").Value.ToString();
                    //string evt = bsd.GetElement("event").Value.ToString();

                    BsonDocument newBSD = new BsonDocument
                    {
                        {"cell" , cell},
                        {"hit" , "evt"}
                    };

                    bsa.Add(newBSD);
                }

                StringBuilder sbQueryX = new StringBuilder();
                if (game[0].GetElement("action").Value.ToString() == "PLAY")
                {
                    if (game[0].GetElement("issuer").Value.ToString() == user_1)
                        sbQueryX.AppendFormat("{{ $set: {{ hits_remote : {0}, action : \"WAIT\", \"next_player\" : \"{1}\" }} }}", bsa, user_2);
                    else
                        sbQueryX.AppendFormat("{{ $set: {{ hits : {0}, action : \"WAIT\", \"next_player\" : \"{1}\"  }} }}", bsa, user_2);
                }
                else
                {
                    if (game[0].GetElement("issuer").Value.ToString() == user_1)
                        sbQueryX.AppendFormat("{{ $set: {{ hits_remote : {0}, action : \"PLAY\", \"next_player\" : \"{1}\"  }} }}", bsa, user_2);
                    else
                        sbQueryX.AppendFormat("{{ $set: {{ hits : {0}, action : \"PLAY\", \"next_player\" : \"{1}\"  }} }}", bsa, user_2);
                }

                MongoUpdateOptions muo = new MongoUpdateOptions();
                muo.Flags = UpdateFlags.Multi;
                BsonDocument queryx = MongoDB.Bson.Serialization.BsonSerializer.Deserialize<BsonDocument>(sbQueryX.ToString());
                UpdateDocument updateDoc = new UpdateDocument(queryx);
                gamersDoc.Update(queryDoc, updateDoc, muo);

                gamers = gamersDoc.Find(queryDoc);
                if (gamers != null)
                {
                    List<BsonDocument> gameboard = gamers.ToList();
                    if (gameboard.Count() > 0)
                    {
                        gameboard[0].RemoveAt(0);
                        return gameboard[0].ToString();
                    }
                }
            }
            catch (Exception ex)
            {
                sb.Clear();
                sb.AppendFormat("{{ \"INT_ERR_9\" : \"{0}\" }}", ex.Message);
                return sb.ToString();
            }

            return sb.ToString();
        }

        private int CountHits(BsonArray bsArray)
        {
            int total = 0;

            foreach (BsonDocument bsa in bsArray)
            {
                if (bsa.Contains("hit"))
                    if (bsa.GetElement("hit").Value.ToString() == "H")
                        total++;
            }

            return total;
        }

        public string GetUserInfo(string data)
        {
            return GetStatus(data);
        }

        public string GetStatus(string data)
        {
            BsonDocument bsd = null;
            try
            {
                bsd = MongoDB.Bson.Serialization.BsonSerializer.Deserialize<BsonDocument>(data);
            }
            catch (Exception e)
            {
                Trace.WriteLine("STATUS-POST-ERROR" + e.Message);
            }

            string userid = "";

            if (bsd.Contains("user"))
                userid = bsd.GetElement("user").Value.ToString();
            else if (bsd.Contains("user1"))
                userid = bsd.GetElement("user1").Value.ToString();
            else
                userid = bsd.GetElement("user_id").Value.ToString();

            //string remoteid = bsd.GetElement("remote").Value.ToString();

            StringBuilder sb = new StringBuilder();
            string s_serverip = "localhost:27017"; // System.Configuration.ConfigurationManager.AppSettings["battleship_server"];
            string s_Database = "battleship"; // System.Configuration.ConfigurationManager.AppSettings["battleship_db"];
            string s_collection = "gamerboard";

            sb.AppendFormat("{{ $or : [ {{\"user_1\":\"{0}\"}}, {{\"user_2\":\"{0}\"}} ] }}", userid);

            GetDB db = new GetDB(s_serverip, s_Database);
            db.GetSystemDatabase(s_Database, s_collection, ref dbMongoREAD, ref s_Database, ref s_collection);

            MongoCollection<BsonDocument> gamersDoc = dbMongoREAD.GetCollection<BsonDocument>(s_collection);
            BsonDocument queryX = MongoDB.Bson.Serialization.BsonSerializer.Deserialize<BsonDocument>(sb.ToString());
            QueryDocument queryDoc = new QueryDocument(queryX);
            MongoCursor<BsonDocument> gamers = gamersDoc.Find(queryDoc);

            //Winner detect
            string winner = "@@@@";

            StringBuilder sbx = new StringBuilder();

            sbx.AppendFormat("{{\"requests\": [");
            int i = 0, b = 0, s = 0;
            foreach (BsonDocument bsdx in gamers)
            {
                bsdx.RemoveAt(0);
                string issuer = bsdx.GetElement("issuer").Value.ToString();
                if (userid == issuer)
                {
                    BsonArray arr = (BsonArray)bsdx.GetElement("hits_remote").Value;
                    BsonArray shp = (BsonArray)bsdx.GetElement("ships_remote").Value;
                    int q = CountHits(arr);
                    b = q;
                    s = shp.Count();
                    if (q == shp.Count() && q != 0)
                    {
                        winner = userid;
                    }
                }
                else
                {
                    BsonArray arr = (BsonArray)bsdx.GetElement("hits").Value;
                    BsonArray shp = (BsonArray)bsdx.GetElement("ships").Value;
                    int q = CountHits(arr);
                    b = q;
                    s = shp.Count();
                    if (q == shp.Count() && q != 0)
                    {
                        winner = userid;
                    }
                }

                if (i > 0)
                    sbx.AppendFormat(",");

                sbx.AppendFormat("{0}", bsdx.ToString());
                i++;
            }
            sbx.AppendFormat("]}}");

            if (winner != "@@@@")   //WINNER FOUND
            {
                StringBuilder sbQueryX = new StringBuilder();
                sbQueryX.AppendFormat("{{ $set: {{ winner : \"{0}\" }} }}", userid);
                MongoUpdateOptions muo = new MongoUpdateOptions();
                muo.Flags = UpdateFlags.Multi;
                BsonDocument queryx = MongoDB.Bson.Serialization.BsonSerializer.Deserialize<BsonDocument>(sbQueryX.ToString());
                UpdateDocument updateDoc = new UpdateDocument(queryx);
                gamersDoc.Update(queryDoc, updateDoc, muo);
            }

            return sbx.ToString();
        }

        public string BattleshipDown(string json)
        {
            Debug.WriteLine("BATTLESHIPDOWN: " + json);
            return ("{}");
        }

        public string PlayAgain(string json)
        {
            Debug.WriteLine("PLAYAGAIN: " + json);
            return ("{}");
        }

        public string DeepSixIt(string json)
        {
            Debug.WriteLine("DEEPSIXIT: " + json);
            return ("{}");
        }

        public string UpdateField(string json)
        {
            Debug.WriteLine("UPDATEFIELD: " + json);
            return ("{}");
        }

        public void UpdateGameBoard(string user, string remote)
        {
            //foreach (string str in UserHandler.ConnectedIds)
            //    Clients.Client(str).SendAsync("UpdateGameBoard", user, remote);

            Clients.All.SendAsync("UpdateGameBoard", user, remote);
        }

        public static class UserHandler
        {
            public static HashSet<string> ConnectedIds = new HashSet<string>();
        }

        public override Task OnConnectedAsync()
        {
            UserHandler.ConnectedIds.Add(Context.ConnectionId);

            //foreach (string str in UserHandler.ConnectedIds)
            Clients.All.SendAsync("send", Context.ConnectionId);

            //foreach (string str in UserHandler.ConnectedIds)
            //    Clients.Client(str).SendAsync("send", str);

            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            UserHandler.ConnectedIds.Remove(Context.ConnectionId);
            return base.OnDisconnectedAsync(exception);
        }
    }
}
