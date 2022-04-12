import { db } from "../app-firebase";
import {
  query,
  collection,
  doc,
  orderBy,
  OrderByDirection,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  where,
} from "firebase/firestore";

export default interface UserGroup {
  id: string;
  name: string;
  userId: string;
}

export namespace UserGroups {
  export const FB_COLLECTION_NAME = "userGroups";

  export async function all(
    userId: string,
    orderByField: string = "name",
    orderByDirection: OrderByDirection = "asc"
  ): Promise<Array<UserGroup>> {
    const userGroupsQuery = query(
      collection(db, FB_COLLECTION_NAME),
      where("userId", "==", userId),
      orderBy(orderByField, orderByDirection)
    );
    const querySnapshot = await getDocs(userGroupsQuery);

    const userGroups = querySnapshot.docs.map((userGroupDoc) => {
      const userGroup = userGroupDoc.data() as UserGroup;
      userGroup.id = userGroupDoc.id;
      return userGroup;
    });

    return userGroups;
  }

  export async function withId(userGroupId: string): Promise<UserGroup> {
    const userGroupDocRef = doc(db, FB_COLLECTION_NAME + "/" + userGroupId);

    const userGroupDoc = await getDoc(userGroupDocRef);
    const userGroup = userGroupDoc.data() as UserGroup;
    userGroup.id = userGroupDoc.id;
    return userGroup;
  }

  export async function create(
    userGroup: UserGroup,
    userId: string
  ): Promise<UserGroup> {
    const docQuery = collection(db, FB_COLLECTION_NAME);
    userGroup.userId = userId;
    const docRef = await addDoc(docQuery, userGroup);

    userGroup.id = docRef.id;

    return {
      ...userGroup,
    } as UserGroup;
  }

  export async function update(
    updates: { [x: string]: any },
    id: string
  ): Promise<void> {
    const docRef = doc(db, FB_COLLECTION_NAME + "/" + id);
    return await updateDoc(docRef, updates);
  }

  export async function remove(id: string) {
    const docRef = doc(db, FB_COLLECTION_NAME + "/" + id);
    return await deleteDoc(docRef);
  }
}
