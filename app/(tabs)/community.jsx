// app/(tabs)/community.jsx
import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../hooks/useAuth";
import { subscribeCommunityPosts, addPost, toggleLike, addComment } from "../../lib/firestore";
import { C, F, R, rs, vs, fs } from "../../constants/theme";
import { Avatar, Sheet, Btn, Empty, timeAgo } from "../../components/UI";
import { useTheme } from "../../context/ThemeContext";

const CATEGORIES = ["All","Bible","Mental","Finance","Academic","Goals","Character"];

export default function CommunityScreen() {
  const { user, profile } = useAuth();
  const theme = useTheme();
  const [posts,      setPosts]      = useState([]);
  const [filter,     setFilter]     = useState("All");
  const [postSheet,  setPostSheet]  = useState(false);
  const [cmtSheet,   setCmtSheet]   = useState(false);
  const [activePost, setActivePost] = useState(null);
  const [postText,   setPostText]   = useState("");
  const [postCat,    setPostCat]    = useState("Bible");
  const [comment,    setComment]    = useState("");
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    return subscribeCommunityPosts(setPosts);
  }, []);

  const filtered = filter === "All" ? posts : posts.filter(p => p.category === filter);
  const name = profile?.name || user?.displayName || "Anonymous";

  const handlePost = async () => {
    if (!postText.trim()) return;
    setLoading(true);
    await addPost({ text: postText.trim(), category: postCat, authorName: name });
    setPostText(""); setPostSheet(false); setLoading(false);
  };

  const handleComment = async () => {
    if (!comment.trim() || !activePost) return;
    await addComment(activePost.id, comment.trim(), name);
    setComment("");
  };

  const handleLike = async (post) => {
    await toggleLike(post.id, post.likes || []);
  };

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: theme.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding:rs(16), paddingBottom:vs(24) }}>
        {/* Header */}
        <View style={{ flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:vs(4) }}>
          <Text style={{ fontFamily:F.bold, fontSize:fs(22), color: theme.text }}>Community 👥</Text>
        </View>
        <Text style={{ fontFamily:F.regular, fontSize:fs(13), color: theme.textSub, marginBottom:vs(14) }}>
          Grow together, stay accountable
        </Text>

        {/* Category filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:vs(14) }}>
          <View style={{ flexDirection:"row", gap:rs(7) }}>
            {CATEGORIES.map(c => (
              <TouchableOpacity key={c} onPress={() => setFilter(c)}
                style={{ backgroundColor: filter===c ? (theme.darkMode ? "#fff" : C.dark) : theme.surface, borderRadius:R.full, paddingVertical:vs(6), paddingHorizontal:rs(14) }}
              >
                <Text style={{ fontFamily:F.semibold, fontSize:fs(12), color: filter===c ? (theme.darkMode ? C.dark : "#fff") : theme.textSub }}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Posts rendering pipeline */}
        {filtered.length === 0 ? (
          <Empty emoji="🌱" title="No posts yet" sub="Be the first to share your growth with the community!" onAction={() => setPostSheet(true)} actionLabel="Share something" />
        ) : (
          <View style={{ gap:vs(10) }}>
            {filtered.map(post => {
              const liked = (post.likes||[]).includes(user?.uid);
              return (
                <View key={post.id} style={{ backgroundColor: theme.card, borderWidth:1, borderColor: theme.border, borderRadius:R.lg, padding:rs(14) }}>
                  {/* Author Header row */}
                  <View style={{ flexDirection:"row", alignItems:"center", gap:rs(10), marginBottom:vs(10) }}>
                    <Avatar name={post.authorName||"?"} size={rs(38)} />
                    <View style={{ flex:1 }}>
                      <Text style={{ fontFamily:F.semibold, fontSize:fs(13), color: theme.text }}>{post.authorName || "Anonymous"}</Text>
                      <Text style={{ fontFamily:F.regular, fontSize:fs(11), color: theme.textSub }}>
                        {timeAgo(post.createdAt)} · {post.category}
                      </Text>
                    </View>
                    {post.authorId === user?.uid && (
                      <TouchableOpacity onPress={() => Alert.alert("Delete post?","", [{text:"Cancel",style:"cancel"},{text:"Delete",style:"destructive",onPress:()=>{}}])}>
                        <Text style={{ color: theme.textSub, fontSize:fs(18) }}>···</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Body text content */}
                  <Text style={{ fontFamily:F.regular, fontSize:fs(13), color: theme.text, lineHeight:vs(20), marginBottom:vs(10) }}>{post.text}</Text>

                  {/* Action row container */}
                  <View style={{ flexDirection:"row", gap:rs(16), paddingTop:vs(9), borderTopWidth:1, borderTopColor: theme.border }}>
                    <TouchableOpacity onPress={() => handleLike(post)} style={{ flexDirection:"row", alignItems:"center", gap:rs(4) }}>
                      <Text style={{ fontSize:fs(16) }}>{liked ? "❤️" : "🤍"}</Text>
                      <Text style={{ fontFamily:F.regular, fontSize:fs(12), color: theme.textSub }}>{(post.likes||[]).length}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => { setActivePost(post); setCmtSheet(true); }}
                      style={{ flexDirection:"row", alignItems:"center", gap:rs(4) }}
                    >
                      <Text style={{ fontSize:fs(16) }}>💬</Text>
                      <Text style={{ fontFamily:F.regular, fontSize:fs(12), color: theme.textSub }}>{(post.comments||[]).length}</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Comment previews */}
                  {(post.comments||[]).length > 0 && (
                    <TouchableOpacity onPress={() => { setActivePost(post); setCmtSheet(true); }}
                      style={{ backgroundColor: theme.surface, borderRadius:R.md, padding:rs(10), marginTop:vs(8) }}
                    >
                      <Text style={{ fontFamily:F.semibold, fontSize:fs(11), color: C.primary, marginBottom:vs(2) }}>
                        {post.comments[post.comments.length-1].authorName}
                      </Text>
                      <Text style={{ fontFamily:F.regular, fontSize:fs(12), color: theme.text }} numberOfLines={2}>
                        {post.comments[post.comments.length-1].text}
                      </Text>
                      {post.comments.length > 1 && (
                        <Text style={{ fontFamily:F.medium, fontSize:fs(11), color: C.primary, marginTop:vs(4) }}>
                          View all {post.comments.length} comments
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => setPostSheet(true)}
        style={{ position:"absolute", bottom:vs(20), right:rs(20), backgroundColor: theme.darkMode ? C.primary : C.dark, borderRadius:R.full, paddingVertical:vs(13), paddingHorizontal:rs(20), flexDirection:"row", alignItems:"center", gap:rs(8), elevation:6, shadowColor:"#000", shadowOpacity:0.2, shadowRadius:8, shadowOffset:{width:0,height:4} }}
      >
        <Text style={{ fontSize:fs(16) }}>✏️</Text>
        <Text style={{ fontFamily:F.bold, fontSize:fs(13), color:C.white }}>Share your win</Text>
      </TouchableOpacity>

      {/* New Post Modal Sheet */}
      <Sheet visible={postSheet} onClose={() => setPostSheet(false)} title="Share with community" style={{ backgroundColor: theme.sheetBg }}>
        <TextInput
          value={postText}
          onChangeText={setPostText}
          placeholder="What are you learning, feeling, or celebrating today?"
          placeholderTextColor={theme.darkMode ? "#4E4B66" : "#C0BDD4"}
          multiline
          autoFocus
          style={{ backgroundColor: theme.inputBg, borderWidth:1, borderColor: theme.border, borderRadius:R.md, padding:rs(13), fontSize:fs(14), color: theme.text, fontFamily:F.regular, minHeight:vs(100), textAlignVertical:"top", marginBottom:vs(12) }}
        />
        <Text style={{ fontFamily:F.semibold, fontSize:fs(11), color: theme.textSub, marginBottom:vs(8), letterSpacing:0.5 }}>CATEGORY</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:vs(16) }}>
          <View style={{ flexDirection:"row", gap:rs(7) }}>
            {CATEGORIES.filter(c=>c!=="All").map(c => (
              <TouchableOpacity key={c} onPress={()=>setPostCat(c)}
                style={{ backgroundColor: postCat===c?C.primaryLight:theme.surface, borderRadius:R.full, paddingVertical:vs(6), paddingHorizontal:rs(13), borderWidth:1, borderColor: postCat===c?C.primary:theme.border }}
              >
                <Text style={{ fontFamily:F.semibold, fontSize:fs(12), color: postCat===c?C.primaryDark:theme.textSub }}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <Btn label="Post" onPress={handlePost} loading={loading} />
      </Sheet>

      {/* Comments Drawer Sheet */}
      <Sheet visible={cmtSheet} onClose={() => setCmtSheet(false)} title="Comments" style={{ backgroundColor: theme.sheetBg }}>
        <ScrollView style={{ maxHeight:vs(280) }} showsVerticalScrollIndicator={false}>
          {(activePost?.comments||[]).map(c => (
            <View key={c.id} style={{ backgroundColor: theme.surface, borderRadius:R.md, padding:rs(10), marginBottom:vs(8) }}>
              <Text style={{ fontFamily:F.semibold, fontSize:fs(12), color:C.primary, marginBottom:vs(2) }}>{c.authorName}</Text>
              <Text style={{ fontFamily:F.regular, fontSize:fs(13), color: theme.text }}>{c.text}</Text>
            </View>
          ))}
          {(activePost?.comments||[]).length === 0 && (
            <Text style={{ fontFamily:F.regular, fontSize:fs(13), color: theme.textSub, textAlign:"center", paddingVertical:vs(20) }}>No comments yet. Be the first!</Text>
          )}
        </ScrollView>
        <View style={{ flexDirection:"row", gap:rs(8), marginTop:vs(12) }}>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Write a comment..."
            placeholderTextColor={theme.darkMode ? "#4E4B66" : "#C0BDD4"}
            style={{ flex:1, backgroundColor: theme.inputBg, borderWidth:1, borderColor: theme.border, borderRadius:R.md, padding:rs(11), fontSize:fs(13), color: theme.text, fontFamily:F.regular }}
          />
          <TouchableOpacity onPress={handleComment} style={{ backgroundColor:C.primary, borderRadius:R.md, paddingHorizontal:rs(16), alignItems:"center", justifyContent:"center" }}>
            <Text style={{ fontFamily:F.bold, fontSize:fs(13), color:"#fff" }}>Send</Text>
          </TouchableOpacity>
        </View>
      </Sheet>
    </SafeAreaView>
  );
}