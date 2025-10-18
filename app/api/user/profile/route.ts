import { NextResponse } from "next/server"
import { firestore, auth as adminAuth } from "@/lib/firebase-admin"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ message: "인증이 필요합니다." }, { status: 401 })
    }

    const token = authHeader.split("Bearer ")[1]
    const decodedToken = await adminAuth.verifyIdToken(token)
    const userId = decodedToken.uid

    // Get user data from Firestore
    const userDoc = await firestore.collection("users").doc(userId).get()
    const userData = userDoc.data()

    // Get user auth data
    const userRecord = await adminAuth.getUser(userId)

    const profile = {
      uid: userId,
      name: userData?.name || userRecord.displayName || "",
      email: userRecord.email || "",
      username: userData?.username || userRecord.email?.split("@")[0] || "",
      bio: userData?.bio || "",
      photoURL: userRecord.photoURL || "",
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("프로필 조회 오류:", error)
    return NextResponse.json({ message: "프로필을 불러올 수 없습니다." }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ message: "인증이 필요합니다." }, { status: 401 })
    }

    const token = authHeader.split("Bearer ")[1]
    const decodedToken = await adminAuth.verifyIdToken(token)
    const userId = decodedToken.uid

    const body = await request.json()
    const { name, username, bio } = body

    // Update user data in Firestore
    await firestore.collection("users").doc(userId).set(
      {
        name,
        username,
        bio,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    )

    // Update displayName in Firebase Auth if name changed
    if (name) {
      await adminAuth.updateUser(userId, {
        displayName: name,
      })
    }

    // Update username in all user's posts and comments
    if (name) {
      // Update discussions
      const discussionsSnapshot = await firestore.collection("discussions").where("author.uid", "==", userId).get()

      const discussionUpdates = discussionsSnapshot.docs.map((doc) => doc.ref.update({ "author.name": name }))

      // Update community wordbooks
      const wordbooksSnapshot = await firestore.collection("communityWordbooks").where("author.uid", "==", userId).get()

      const wordbookUpdates = wordbooksSnapshot.docs.map((doc) => doc.ref.update({ "author.name": name }))

      // Update comments across all discussions
      const allDiscussionsSnapshot = await firestore.collection("discussions").get()
      const commentUpdates: Promise<any>[] = []

      for (const discussionDoc of allDiscussionsSnapshot.docs) {
        const commentsSnapshot = await firestore
          .collection("discussions")
          .doc(discussionDoc.id)
          .collection("comments")
          .where("author.uid", "==", userId)
          .get()

        commentsSnapshot.docs.forEach((commentDoc) => {
          commentUpdates.push(commentDoc.ref.update({ "author.name": name }))
        })
      }

      await Promise.all([...discussionUpdates, ...wordbookUpdates, ...commentUpdates])
    }

    return NextResponse.json({ message: "프로필이 업데이트되었습니다." })
  } catch (error) {
    console.error("프로필 업데이트 오류:", error)
    return NextResponse.json({ message: "프로필 업데이트에 실패했습니다." }, { status: 500 })
  }
}
